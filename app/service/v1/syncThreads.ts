// app/service/v1/syncThreads.ts
// Sync Gmail threads via Corsair.
//
// Two modes:
//   syncThreads()           — synchronous, returns result when done (for small syncs)
//   syncThreadsBackground() — fire-and-forget, runs in background (for large syncs 100+)
//
// Both use a concurrent worker pool instead of fixed batches, and retry
// on 429/5xx from the Gmail API. Classify + embed runs ONCE at the end,
// not after every batch — avoids wasted LLM calls on partial data.

import { corsair } from '@/corsair';
import { getOwnEmail } from '@/lib/v1/get-own-email';
import { ingestMessage } from '@/lib/v1/upsert';
import { classifySyncedEmails } from '@/lib/v1/ai/classify';
import { extractAssetsForEmail } from '@/lib/v1/assets';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const FETCH_CONCURRENCY = 20; // Max parallel threads.get calls (safe under Gmail's 250 units/sec)
const RETRY_ATTEMPTS = 3;     // Retries on 429 / 5xx
const RETRY_BASE_MS = 1000;   // Exponential backoff base: 1s → 2s → 4s

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SyncThreadsResult = {
  listTimeMs: number;
  fullDataTimeMs: number;
  threadsFetched: number;
  messagesIngested: number;
  messagesSkipped: number;
  errors: string[];
};

export type SyncStatus = {
  status: 'idle' | 'syncing' | 'done' | 'error';
  total: number;
  fetched: number;
  ingested: number;
  skipped: number;
  classified: boolean;
  errors: string[];
  startedAt: number | null;
  finishedAt: number | null;
  durationMs: number | null;
};

// ---------------------------------------------------------------------------
// Per-tenant sync state (in-memory — resets on server restart)
// ---------------------------------------------------------------------------

// Persist across hot reloads in dev mode (same pattern as db.ts pool)
const globalForSync = globalThis as typeof globalThis & {
  syncStates?: Map<string, SyncStatus>;
};
const syncStates = globalForSync.syncStates ?? new Map<string, SyncStatus>();
if (process.env.NODE_ENV !== 'production') {
  globalForSync.syncStates = syncStates;
}

function freshState(): SyncStatus {
  return {
    status: 'idle',
    total: 0,
    fetched: 0,
    ingested: 0,
    skipped: 0,
    classified: false,
    errors: [],
    startedAt: null,
    finishedAt: null,
    durationMs: null,
  };
}

export function getSyncStatus(tenantId: string): SyncStatus {
  return syncStates.get(tenantId) ?? freshState();
}

// ---------------------------------------------------------------------------
// Retry helper — handles Gmail API 429 (rate limit) and 5xx (transient)
// ---------------------------------------------------------------------------

async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxAttempts = RETRY_ATTEMPTS,
): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const status = err?.status ?? err?.statusCode ?? err?.code;
      const isRetryable = status === 429 || (typeof status === 'number' && status >= 500);

      if (!isRetryable || attempt === maxAttempts - 1) {
        throw err;
      }

      const backoffMs = RETRY_BASE_MS * Math.pow(2, attempt);
      console.warn(
        `[sync] ${label} failed (attempt ${attempt + 1}/${maxAttempts}), ` +
        `retrying in ${backoffMs}ms: ${err?.message ?? err}`,
      );
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  // Unreachable, but TypeScript needs it
  throw new Error(`${label} failed after ${maxAttempts} attempts`);
}

// ---------------------------------------------------------------------------
// Worker pool — N workers pull from a shared queue, zero idle gaps
// ---------------------------------------------------------------------------

async function runWorkers<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  const queue = [...items];
  const workers = Array.from(
    { length: Math.min(concurrency, queue.length) },
    async () => {
      while (queue.length > 0) {
        const item = queue.shift()!;
        await fn(item);
      }
    },
  );
  await Promise.all(workers);
}

// ---------------------------------------------------------------------------
// Core: fetch a single thread + ingest all its messages
// ---------------------------------------------------------------------------

async function fetchAndIngestThread(
  threadId: string,
  tenant: ReturnType<typeof corsair.withTenant>,
  ownEmail: string,
  tenantId: string,
  counters: { fetched: number; ingested: number; skipped: number; errors: string[] },
): Promise<void> {
  try {
    const thread = await withRetry(
      () => tenant.gmail.api.threads.get({ id: threadId, format: 'full' }),
      `threads.get(${threadId})`,
    );

    counters.fetched++;

    for (const message of thread.messages ?? []) {
      const result = await ingestMessage(message, ownEmail, tenantId);
      if (result.ok) {
        counters.ingested++;
        extractAssetsForEmail(result.id as string, tenantId).catch(() => {});
      } else {
        counters.skipped++;
        if (result.error) {
          counters.errors.push(`msg ${result.id}: ${result.error}`);
        }
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    counters.errors.push(`thread ${threadId}: ${msg}`);
    console.error(`[sync] thread ${threadId} failed after retries:`, msg);
  }
}

// ---------------------------------------------------------------------------
// Background sync — fire-and-forget, tracks progress via getSyncStatus()
// ---------------------------------------------------------------------------

export async function syncThreadsBackground(
  maxResults = 500,
  tenantId = 'default',
): Promise<void> {
  // Prevent duplicate syncs for the same tenant
  const existing = syncStates.get(tenantId);
  if (existing?.status === 'syncing') {
    console.log(`[sync] already syncing for tenant ${tenantId} — skipping`);
    return;
  }

  const state: SyncStatus = {
    status: 'syncing',
    total: 0,
    fetched: 0,
    ingested: 0,
    skipped: 0,
    classified: false,
    errors: [],
    startedAt: Date.now(),
    finishedAt: null,
    durationMs: null,
  };
  syncStates.set(tenantId, state);

  try {
    const tenant = corsair.withTenant(tenantId);
    const ownEmail = await getOwnEmail(tenantId);

    // --- Stage 1: List thread IDs ---
    console.log(`[sync] listing up to ${maxResults} threads for tenant ${tenantId}...`);

    const listResponse = await withRetry(
      () => tenant.gmail.api.threads.list({ maxResults, labelIds: ['INBOX'] }),
      'threads.list',
    );

    const threadIds = (listResponse.threads ?? [])
      .map((thread) => thread.id)
      .filter((id): id is string => Boolean(id));

    state.total = threadIds.length;
    console.log(`[sync] found ${threadIds.length} threads`);

    if (threadIds.length === 0) {
      state.status = 'done';
      state.finishedAt = Date.now();
      state.durationMs = state.finishedAt - state.startedAt!;
      return;
    }

    // --- Stage 2: Fetch + ingest via worker pool ---
    // Workers overlap naturally: while worker A is writing to DB,
    // workers B-T are fetching from Gmail. No idle gaps.
    const counters = state; // state IS the counters — workers update it directly

    await runWorkers(threadIds, FETCH_CONCURRENCY, (threadId) =>
      fetchAndIngestThread(threadId, tenant, ownEmail, tenantId, counters),
    );

    console.log(
      `[sync] ingest complete: ${state.ingested} messages from ${state.fetched}/${state.total} threads` +
      (state.skipped > 0 ? `, ${state.skipped} skipped` : ''),
    );

    // --- Stage 3: AI classify + embed (runs once for all new emails) ---
    // classifySyncedEmails processes in batches internally and chains to
    // embedPendingEmails automatically when done.
    console.log('[sync] starting AI classification + embedding pipeline...');
    try {
      await classifySyncedEmails(tenantId);
      state.classified = true;
      console.log('[sync] classification pipeline complete');
    } catch (err) {
      console.error('[sync] classify pipeline failed:', err);
      state.errors.push(`classify: ${err instanceof Error ? err.message : String(err)}`);
    }

    state.status = 'done';
  } catch (err) {
    console.error('[sync] pipeline failed:', err);
    state.status = 'error';
    state.errors.push(err instanceof Error ? err.message : String(err));
  } finally {
    state.finishedAt = Date.now();
    state.durationMs = state.finishedAt - (state.startedAt ?? state.finishedAt);
    console.log(
      `[sync] finished in ${(state.durationMs / 1000).toFixed(1)}s — ` +
      `status: ${state.status}, ingested: ${state.ingested}, errors: ${state.errors.length}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Synchronous sync — for small batches, returns result directly
// Uses worker pool (not fixed batches) for better throughput.
// Classify fires once at the end, not per-batch.
// ---------------------------------------------------------------------------

export async function syncThreads(
  maxResults = 25,
  tenantId = 'default',
): Promise<SyncThreadsResult> {
  const tenant = corsair.withTenant(tenantId);
  const ownEmail = await getOwnEmail(tenantId);

  const listStart = Date.now();
  const listResponse = await withRetry(
    () => tenant.gmail.api.threads.list({ maxResults, labelIds: ['INBOX'] }),
    'threads.list',
  );
  const listTimeMs = Date.now() - listStart;

  const threadIds = (listResponse.threads ?? [])
    .map((thread) => thread.id)
    .filter((id): id is string => Boolean(id));

  const fullDataStart = Date.now();
  const result: SyncThreadsResult = {
    listTimeMs,
    fullDataTimeMs: 0,
    threadsFetched: 0,
    messagesIngested: 0,
    messagesSkipped: 0,
    errors: [],
  };

  // Worker pool instead of fixed batches — no idle gaps between rounds
  await runWorkers(threadIds, FETCH_CONCURRENCY, async (threadId) => {
    try {
      const thread = await withRetry(
        () => tenant.gmail.api.threads.get({ id: threadId, format: 'full' }),
        `threads.get(${threadId})`,
      );

      result.threadsFetched++;

      for (const message of thread.messages ?? []) {
        const ingestResult = await ingestMessage(message, ownEmail, tenantId);
        if (ingestResult.ok) {
          result.messagesIngested++;
          extractAssetsForEmail(ingestResult.id as string, tenantId).catch(() => {});
        } else {
          result.messagesSkipped++;
          if (ingestResult.error) {
            result.errors.push(`msg ${ingestResult.id}: ${ingestResult.error}`);
          }
        }
      }
    } catch (err) {
      result.errors.push(
        err instanceof Error ? err.message : String(err),
      );
    }
  });

  result.fullDataTimeMs = Date.now() - fullDataStart;

  // Single classify + embed nudge at the end (not per-batch)
  classifySyncedEmails(tenantId).catch((err) =>
    console.error('[sync] classify nudge failed:', err),
  );

  return result;
}

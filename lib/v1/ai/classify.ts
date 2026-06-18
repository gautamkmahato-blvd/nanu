// lib/v1/ai/classify.ts
//
// Calls the AI API for each unprocessed email and stores the raw response.
// No transformation, no priority derivation — just fetch and save.

import { sql } from 'drizzle-orm';
import { db } from '@/db';
import openRouterAnalysis from '@/app/process/openRouterAnalysis';
import { extractJsonFromLLM } from '@/lib/utils';
import { embedPendingEmails } from '../ai-chat/embeddings/batch';

const BATCH_SIZE = 10;
const CONCURRENCY = 5;
const MAX_BATCHES_PER_RUN = 10;
const BODY_CHARS = 1500;
const STALE_CLAIM_MINUTES = 10;

type PendingEmail = {
  id: string;
  subject: string | null;
  snippet: string | null;
  body_text: string | null;
  from_email: string;
  to_emails: string[] | null;
};

export type ClassifyStats = {
  batches: number;
  analyzed: number;
  failed: number;
  remaining: number;
};

// ---------------------------------------------------------------------------
// DB operations
// ---------------------------------------------------------------------------

async function claimBatch(): Promise<PendingEmail[]> {
  const result = await db.execute(sql`
    UPDATE emails
    SET ai_processed_at = now()
    WHERE id IN (
      SELECT id FROM emails
      WHERE is_sent = false
        AND (
          ai_processed_at IS NULL
          OR (
            ai_analysis IS NULL
            AND ai_processed_at < now() - (${STALE_CLAIM_MINUTES} * interval '1 minute')
          )
        )
      ORDER BY received_at DESC
      LIMIT ${BATCH_SIZE}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id, subject, snippet, body_text, from_email, to_emails
  `);
  return result.rows as PendingEmail[];
}

async function releaseClaim(id: string): Promise<void> {
  await db.execute(sql`
    UPDATE emails
    SET ai_processed_at = NULL
    WHERE id = ${id} AND ai_analysis IS NULL
  `).catch(() => {});
}

// async function saveRawResponse(emailId: string, raw: Record<string, unknown>): Promise<void> {
//   await db.execute(sql`
//     UPDATE emails
//     SET ai_analysis = ${JSON.stringify(raw)}::jsonb,
//         ai_processed_at = now(),
//         updated_at = now()
//     WHERE id = ${emailId}
//   `);
// }

async function saveRawResponse(
  emailId: string,
  rawText: string,
  cleaned: Record<string, unknown> | null,
): Promise<void> {
  await db.execute(sql`
    UPDATE emails
    SET ai_analysis = ${cleaned ? JSON.stringify(cleaned) : null}::jsonb,
        ai_raw_response = ${rawText},
        ai_processed_at = now(),
        updated_at = now()
    WHERE id = ${emailId}
  `);
}

async function countPending(): Promise<number> {
  const result = await db.execute(sql`
    SELECT COUNT(*)::int AS n FROM emails
    WHERE is_sent = false AND ai_processed_at IS NULL
  `);
  return Number((result.rows[0] as { n?: number })?.n ?? 0);
}

// ---------------------------------------------------------------------------
// Anthropic API call — returns raw parsed JSON, no transformation
// ---------------------------------------------------------------------------

function extractJson(text: string): Record<string, unknown> {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object in LLM response');
  }
  return JSON.parse(text.slice(start, end + 1));
}

function buildUserContent(emailData: PendingEmail): string {
  const body = (emailData.body_text ?? emailData.snippet ?? '')
    .replace(/\s+/g, ' ')
    .slice(0, BODY_CHARS);

  return [
    `from_email: ${emailData.from_email}`,
    `to_emails: ${(emailData.to_emails ?? []).join(', ')}`,
    `subject: ${emailData.subject ?? ''}`,
    `body_text: ${body}`,
  ].join('\n');
}

class LlmApiError extends Error {}

async function fakeLLMResponse(emailData: PendingEmail) {
  // we need to call teh LLM here
  const userContent = buildUserContent(emailData);
  const response = await openRouterAnalysis(userContent);

  if (!response?.status) {
    // API-level failure: transient — caller releases the claim for retry.
    const reason =
      typeof response?.message === 'string' && response.message
        ? response.message.slice(0, 200)
        : 'no error message returned';
    throw new LlmApiError(`aiReasoning failed after ${reason}`);
  }

  const result = JSON.stringify(response.result); 

  return {
    status: true,
    aiResponse: result,
  }
}

async function callAnthropic(emailData: PendingEmail): Promise<Record<string, unknown>> {
  
  const res = await fakeLLMResponse(emailData)

  if (!res.status) {
    throw new Error(`Fake LLM call failed`);
  }

  const data = JSON.stringify(res.aiResponse);

  return extractJson(data);
}

// ---------------------------------------------------------------------------
// Process one email — never throws
// ---------------------------------------------------------------------------

// async function processOne(emailData: PendingEmail): Promise<'analyzed' | 'failed'> {
//   try {
//     const raw = await callAnthropic(emailData);
//     const rawText = raw.aiResponse ?? '';
//     const cleaned = extractJsonFromLLM(rawText);  // strips fences, fixes trailing commas
//     await saveRawResponse(emailData.id, cleaned);
//     console.log(`[ai] ✓ ${emailData.id} — ${emailData.subject?.slice(0, 40) ?? '(no subject)'}`);
//     return 'analyzed';
//   } catch (error) {
//     console.warn(`[ai] ✗ ${emailData.id}: ${error instanceof Error ? error.message : error}`);
//     await releaseClaim(emailData.id);
//     return 'failed';
//   }
// }

// Delete callAnthropic entirely. Replace fakeLLMResponse + processOne with:

async function getLLMResponse(emailData: PendingEmail): Promise<string> {
  const userContent = buildUserContent(emailData);
  const response = await openRouterAnalysis(userContent);

  if (!response?.status) {
    throw new LlmApiError(response?.message?.slice(0, 200) ?? 'LLM call failed');
  }

  return response.result ?? '';
}

async function processOne(emailData: PendingEmail): Promise<'analyzed' | 'failed'> {
  try {
    const rawText = await getLLMResponse(emailData);

    let cleaned: Record<string, unknown> | null = null;
    try {
      cleaned = extractJsonFromLLM(rawText);
    } catch {
      console.warn(`[ai] ⚠ ${emailData.id}: JSON parse failed, saving raw text only`);
    }

    await saveRawResponse(emailData.id, rawText, cleaned);
    console.log(`[ai] ${cleaned ? '✓' : '⚠'} ${emailData.id} — ${emailData.subject?.slice(0, 40) ?? '(no subject)'}`);
    return 'analyzed';
  } catch (error) {
    console.warn(`[ai] ✗ ${emailData.id}: ${error instanceof Error ? error.message : error}`);
    await releaseClaim(emailData.id);
    return 'failed';
  }
}

// ---------------------------------------------------------------------------
// Concurrency helper
// ---------------------------------------------------------------------------

async function runConcurrent<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length > 0) await fn(queue.shift()!);
  });
  await Promise.all(workers);
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

let running = false;

export async function classifySyncedEmails(): Promise<ClassifyStats> {
  const stats: ClassifyStats = { batches: 0, analyzed: 0, failed: 0, remaining: 0 };

  if (running) {
    stats.remaining = await countPending().catch(() => 0);
    return stats;
  }

  running = true;
  try {
    for (let b = 0; b < MAX_BATCHES_PER_RUN; b++) {
      const batch = await claimBatch();
      if (batch.length === 0) break;
      stats.batches++;

      let batchFailed = 0;

      await runConcurrent(batch, CONCURRENCY, async (emailData) => {
        const result = await processOne(emailData);
        if (result === 'analyzed') stats.analyzed++;
        else { stats.failed++; batchFailed++; }
      });

      // API probably down — stop hammering
      if (batchFailed > batch.length / 2) break;
    }

    stats.remaining = await countPending().catch(() => 0);

    if (stats.batches > 0) {
      console.log(`[ai] done: ${stats.analyzed} analyzed, ${stats.failed} failed, ${stats.remaining} remaining`);
    }

    // Nudge embedding pipeline after classification
    embedPendingEmails().catch((err) =>
      console.error('[embed] post-classify nudge failed:', err),
    );

    return stats;

  } finally {
    running = false;
  }
}
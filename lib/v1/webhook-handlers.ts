// lib/v1/webhook-handlers.ts
// Handlers for Corsair's processed Gmail webhook events.
// Called from the gmail() plugin's webhookHooks.messageChanged.after hook.
//
// Design notes:
// - Pub/Sub delivers at-least-once and out of order. Every handler here is
//   idempotent (upserts / no-op deletes), so duplicates are harmless.
// - Webhook handlers must be FAST (the sender times out and retries).
//   Each handler is 1-3 queries; the own-email lookup is memoized.
// - IMPORTANT: this module must NOT import '@/corsair' at the top level —
//   corsair.ts imports this file for its hooks, which would be a circular
//   import. The one place we need the client uses a lazy dynamic import.

import { eq, and, sql } from 'drizzle-orm';

import { db } from '@/db';
import { emails } from '@/db/schema';
import { getOwnEmail } from '@/lib/v1/get-own-email';
import { deriveLabelFlags, type GmailMessage } from '@/lib/v1/parser';
import { ingestMessage } from '@/lib/v1/upsert';
import { classifySyncedEmails } from '@/lib/v1/ai/classify';
import { getEmailById } from './queries/ai-email-detail';
import { checkAndNotifyPriorityEmail } from './priority-contacts/notify';
import { extractAssetsForEmail } from './assets';

// ---------------------------------------------------------------------------
// Event shape (from docs.corsair.dev/plugins/gmail/webhooks "Response data")
// ---------------------------------------------------------------------------

export type GmailWebhookEvent = {
  type: 'messageReceived' | 'messageDeleted' | 'messageLabelChanged';
  emailAddress?: string;
  historyId?: string;
  message?: GmailMessage;
  labelsAdded?: string[];
  labelsRemoved?: string[];
};

/** Runtime guard — webhook payloads are untrusted input even after Corsair processing. */
export function isGmailWebhookEvent(value: unknown): value is GmailWebhookEvent {
  if (!value || typeof value !== 'object') return false;
  const type = (value as { type?: unknown }).type;
  return (
    type === 'messageReceived' ||
    type === 'messageDeleted' ||
    type === 'messageLabelChanged'
  );
}

// ---------------------------------------------------------------------------
// Own-email memo — per-tenant cache, avoids one DB query per webhook delivery
// ---------------------------------------------------------------------------

const ownEmailCache = new Map<string, { value: string; expiresAt: number }>();
const OWN_EMAIL_TTL_MS = 5 * 60 * 1000;

async function getOwnEmailCached(tenantId: string): Promise<string> {
  const now = Date.now();
  const cached = ownEmailCache.get(tenantId);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }
  const value = await getOwnEmail(tenantId);
  // Only cache a hit; an empty value should be retried next delivery.
  if (value) {
    ownEmailCache.set(tenantId, { value, expiresAt: now + OWN_EMAIL_TTL_MS });
  }
  return value;
}

// ---------------------------------------------------------------------------
// Fetch a full message when the webhook only carried a stub
// ---------------------------------------------------------------------------

async function fetchFullMessage(messageId: string, tenantId: string): Promise<GmailMessage | null> {
  try {
    // Lazy import breaks the corsair.ts <-> webhook-handlers.ts cycle.
    const { corsair } = await import('@/corsair');
    const tenant = corsair.withTenant(tenantId);
    const message = await tenant.gmail.api.messages.get({
      id: messageId,
      format: 'full',
    });
    return message as GmailMessage;
  } catch (error) {
    console.error(`[webhook] failed to fetch full message ${messageId}:`, error);
    return null;
  }
}

type GmailMessageWithPayload = GmailMessage & {
  id: string;
  payload: NonNullable<GmailMessage['payload']>;
};

/** A message is ingestable only if it has body/header data, not just an id. */
function hasFullPayload(
  message: GmailMessage | undefined,
): message is GmailMessageWithPayload {
  return Boolean(message?.id && message.payload);
}

// ---------------------------------------------------------------------------
// Handlers — one per event type
// ---------------------------------------------------------------------------

/** Fallback: use Gmail History API to find the latest message when we only have a historyId */
async function fetchLatestFromHistory(historyId: string, tenantId: string): Promise<GmailMessage | null> {
  try {
    const { corsair } = await import('@/corsair');
    const tenant = corsair.withTenant(tenantId);

    // List the single most recent message
    const list = await tenant.gmail.api.messages.list({
      maxResults: 1,
      q: 'newer_than:1m',
    });

    const messageId = list.messages?.[0]?.id;
    if (!messageId) return null;

    const message = await tenant.gmail.api.messages.get({
      id: messageId,
      format: 'full',
    });
    return message as GmailMessage;
  } catch (error) {
    console.error(`[webhook] history fallback failed:`, error);
    return null;
  }
}

export async function handleMessageReceived(event: GmailWebhookEvent, tenantId: string): Promise<void> {
  // Log the actual shape — delete this line once we see what's in it
  console.log('[webhook:debug] event.message:', JSON.stringify(event.message)?.slice(0, 500));
  console.log('[webhook:debug] event keys:', Object.keys(event));

  let message = event.message;

  if (!hasFullPayload(message)) {
    // Try every possible location for the message ID
    const msg = event.message as Record<string, unknown> | undefined;
    const id = (
      msg?.id ??
      msg?.messageId ??
      msg?.message_id ??
      // Corsair might put the Gmail message ID at the event level
      (event as Record<string, unknown>).messageId ??
      (event as Record<string, unknown>).message_id
    ) as string | undefined;

    console.log('[webhook:debug] resolved id:', id);

    if (!id) {
      // Last resort: use historyId to fetch the latest message via Gmail History API
      const historyId = event.historyId;
      if (historyId) {
        console.log(`[webhook] no message id, falling back to history ${historyId}`);
        message = await fetchLatestFromHistory(historyId, tenantId) ?? undefined;
      }

      if (!hasFullPayload(message)) {
        console.warn('[webhook] messageReceived — could not resolve any message id. event:', 
          JSON.stringify(event)?.slice(0, 300));
        return;
      }
    } else {
      message = (await fetchFullMessage(id, tenantId)) ?? undefined;
      if (!hasFullPayload(message)) {
        console.warn(`[webhook] could not hydrate message ${id} — skipping`);
        return;
      }
    }
  }

  console.log('[------ DB Insert Starts here ----] ');

  const ownEmail = await getOwnEmailCached(tenantId);
  const result = await ingestMessage(message, ownEmail, tenantId);
  if (result.ok) {
    console.log(`[webhook] ingested message ${result.id}`);

    // Nudge AI analysis — fire-and-forget, classify chains to embed automatically
    classifySyncedEmails(tenantId).catch((err) =>
      console.error('[webhook] ai nudge failed:', err),
    );

    // Inside handleMessageReceived, after "console.log(`[webhook] ingested message ${result.id}`);"
    extractAssetsForEmail(result.id as string, tenantId).catch((err) =>
      console.warn('[webhook] asset extraction failed:', err),
    );

    // After the email is saved/processed, add:
    // Priority contact notification — fire-and-forget
    getEmailById(result.id as string, tenantId).then((email) => {
      console.log(`[priority-debug] email found: ${!!email}, fromEmail: ${email?.fromEmail}`);
      if (email) {
        checkAndNotifyPriorityEmail({
          fromEmail: email.fromEmail,
          fromName: email.fromName,
          subject: email.subject ?? null,
          snippet: email.snippet ?? null,
        }, tenantId).catch((err) => console.warn('[webhook] priority notify failed:', err));
      }
    });

  }
}

export async function handleMessageDeleted(event: GmailWebhookEvent, tenantId: string): Promise<void> {
  const id = event.message?.id;
  if (!id) {
    console.warn('[webhook] messageDeleted without a message id — skipping');
    return;
  }

  // Deleting a row we never had is a no-op — safe for out-of-order delivery.
  await db.delete(emails).where(and(eq(emails.tenantId, tenantId), eq(emails.id, id)));
  console.log(`[webhook] deleted message ${id}`);
}

export async function handleMessageLabelChanged(event: GmailWebhookEvent, tenantId: string): Promise<void> {
  const message = event.message;
  const id = message?.id;
  if (!id) {
    console.warn('[webhook] messageLabelChanged without a message id — skipping');
    return;
  }

  // Best case: the event carried the full message — one idempotent upsert
  // refreshes labels AND content (covers the out-of-order "update before
  // create" case, since upsert inserts if the row is missing).
  if (hasFullPayload(message)) {
    const ownEmail = await getOwnEmailCached(tenantId);
    await ingestMessage(message, ownEmail, tenantId);
    return;
  }

  // Fallback 1: stub + label deltas. Apply the delta to the stored labelIds
  // and recompute the derived flags — no API call needed, keeps it fast.
  const added = event.labelsAdded ?? [];
  const removed = event.labelsRemoved ?? [];

  if (added.length > 0 || removed.length > 0) {
    const [existing] = await db
      .select({ labelIds: emails.labelIds })
      .from(emails)
      .where(and(eq(emails.tenantId, tenantId), eq(emails.id, id)))
      .limit(1);

    if (existing) {
      const next = new Set(existing.labelIds ?? []);
      for (const label of added) next.add(label);
      for (const label of removed) next.delete(label);

      const labelIds = [...next];
      const flags = deriveLabelFlags(labelIds);

      await db
        .update(emails)
        .set({ labelIds, ...flags, updatedAt: new Date() })
        .where(and(eq(emails.tenantId, tenantId), eq(emails.id, id)));
      console.log(`[webhook] applied label delta to ${id}`);
      return;
    }
  }

  // Fallback 2: we don't have the row (or no deltas were sent) — hydrate.
  const full = await fetchFullMessage(id, tenantId);
  if (hasFullPayload(full ?? undefined)) {
    const ownEmail = await getOwnEmailCached(tenantId);
    await ingestMessage(full!, ownEmail, tenantId);
  } else {
    console.warn(`[webhook] label change for unknown message ${id}, hydrate failed — skipping`);
  }
}

/** Mirrors Corsair's WebhookResponse — kept local because the SDK doesn't export it. */
export type CorsairWebhookResponse<TData = unknown> = {
  success: boolean;
  corsairEntityId?: string;
  data?: TData;
  error?: string;
  statusCode?: number;
};

// ---------------------------------------------------------------------------
// Dispatcher — single entry point used by the after hook
// ---------------------------------------------------------------------------

export async function handleGmailWebhookEvent(
  response: any,
  tenantId = 'default',
): Promise<void> {
  const event = response.data;
  console.log('[------ event type ----] ', event?.type, '| tenant:', tenantId);
  if (!isGmailWebhookEvent(event)) {
    console.warn('[webhook] unrecognized gmail event shape — ignoring');
    return;
  }

  switch (event.type) {
    case 'messageReceived':
      return handleMessageReceived(event, tenantId);
    case 'messageDeleted':
      return handleMessageDeleted(event, tenantId);
    case 'messageLabelChanged':
      return handleMessageLabelChanged(event, tenantId);
  }
}
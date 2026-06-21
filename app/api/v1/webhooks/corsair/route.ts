// app/api/v1/webhooks/corsair/route.ts
// Pool-exhaustion-aware webhook route. Returns 503 (not 500) when the DB pool
// is full, which tells Pub/Sub to back off instead of retrying immediately.
// FIXED: resolves tenantId from Gmail Pub/Sub payload email address
// instead of relying on ?tenantId query param (which Pub/Sub doesn't send).

import { NextResponse } from 'next/server';
import { processWebhook } from 'corsair';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { corsair } from '@/corsair';

import { webhookLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';
type WebhookBody = Record<string, unknown>;

type WebhookResponse = {
  success: boolean;
  corsairEntityId?: string;
  returnToSender?: Record<string, string>;
  data?: unknown;
  error?: string;
  statusCode?: number;
  responseHeaders?: Record<string, string>;
};

function parseWebhookBody(value: unknown): WebhookBody | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as WebhookBody;
}

function isPoolExhausted(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const msg = String((error as { message?: string }).message ?? '');
  return (
    msg.includes('EMAXCONNSESSION') ||
    msg.includes('max clients') ||
    msg.includes('too many connections') ||
    msg.includes('remaining connection slots')
  );
}

// ---------------------------------------------------------------------------
// Resolve tenantId from Gmail Pub/Sub webhook payload
// ---------------------------------------------------------------------------
// Gmail Pub/Sub sends: { message: { data: "<base64>" } }
// Decoded data: { emailAddress: "user@gmail.com", historyId: "12345" }
// We look up which tenant owns that email address from our emails table.
// Excludes 'default' tenant — those are orphaned rows from old CLI setup.
// ---------------------------------------------------------------------------

async function resolveTenantFromPayload(body: WebhookBody): Promise<string | null> {
  try {
    const message = body.message as Record<string, unknown> | undefined;
    if (!message?.data || typeof message.data !== 'string') return null;

    // Decode the base64 Pub/Sub data
    const decoded = Buffer.from(message.data, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    const emailAddress = parsed?.emailAddress;

    if (!emailAddress || typeof emailAddress !== 'string') return null;

    console.log(`[webhook] resolving tenant for email: ${emailAddress}`);

    // Look up the tenant that owns this email address
    // Check sent emails first (most reliable — from_email on sent mail = the user's own address)
    // Exclude 'default' tenant — those are stale rows from old CLI auth
    const result = await db.execute(sql`
      SELECT DISTINCT tenant_id FROM emails
      WHERE LOWER(from_email) = ${emailAddress.toLowerCase()}
        AND is_sent = true
        AND tenant_id != 'default'
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      const tid = String((result.rows[0] as Record<string, unknown>).tenant_id);
      console.log(`[webhook] resolved tenant ${tid} from sent emails`);
      return tid;
    }

    // Fallback: check received emails (to_emails contains the user's address)
    // This handles the case where user received mail but hasn't sent any yet
    const fallback = await db.execute(sql`
      SELECT DISTINCT tenant_id FROM emails
      WHERE to_emails::text ILIKE ${`%${emailAddress.toLowerCase()}%`}
        AND tenant_id != 'default'
      LIMIT 1
    `);

    if (fallback.rows.length > 0) {
      const tid = String((fallback.rows[0] as Record<string, unknown>).tenant_id);
      console.log(`[webhook] resolved tenant ${tid} from received emails`);
      return tid;
    }

    console.warn(`[webhook] no tenant found for email: ${emailAddress}`);
    return null;
  } catch (err) {
    console.warn('[webhook] failed to resolve tenant from payload:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: Request) {
  let body: WebhookBody;

const rl = await rateLimit(request, webhookLimiter, 'webhook'); if (rl) return rl;

  try {
    const parsed = parseWebhookBody(await request.json());
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    body = parsed;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const url = new URL(request.url);

  try {
    // Resolve tenantId: query param > payload email lookup > reject
    let tenantId = url.searchParams.get('tenantId');

    if (!tenantId || tenantId === 'default') {
      tenantId = await resolveTenantFromPayload(body);
    }

    // No valid tenant found — return 200 so Pub/Sub stops retrying
    if (!tenantId || tenantId === 'default') {
      console.warn('[webhook] no valid tenant — acknowledging to stop retries');
      return NextResponse.json({ ok: true, skipped: 'no_tenant' }, { status: 200 });
    }

    const result = await processWebhook(
      corsair,
      Object.fromEntries(request.headers),
      body,
      { tenantId },
    );

    if (result.plugin) {
      console.log(`[webhook] handled by ${result.plugin}.${result.action} | tenant: ${tenantId}`);
    }

    const webhook = result.response as WebhookResponse | undefined;

    if (!webhook) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const status = webhook.statusCode ?? (webhook.success ? 200 : 500);
    const responseBody =
      webhook.returnToSender ??
      webhook.data ??
      (webhook.error
        ? { success: webhook.success, error: webhook.error }
        : { success: webhook.success });

    return NextResponse.json(responseBody, {
      status,
      headers: {
        ...webhook.responseHeaders,
        ...result.responseHeaders,
      },
    });
  } catch (error) {
    // Pool exhaustion: 503 tells Pub/Sub "I'm temporarily overloaded, back off"
    // instead of 500 which just means "retry now." This breaks the death spiral
    // where retries cause more connections which cause more failures.
    if (isPoolExhausted(error)) {
      console.warn('[webhook] DB pool exhausted — returning 503');
      return NextResponse.json(
        { error: 'Database temporarily overloaded' },
        {
          status: 503,
          headers: { 'Retry-After': '10' },
        },
      );
    }

    console.error('[webhook] processing failed:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 },
    );
  }
}
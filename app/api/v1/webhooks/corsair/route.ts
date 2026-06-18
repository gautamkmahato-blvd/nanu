// app/api/v1/webhooks/corsair/route.ts
// Pool-exhaustion-aware webhook route. Returns 503 (not 500) when the DB pool
// is full, which tells Pub/Sub to back off instead of retrying immediately.
import { NextResponse } from 'next/server';
import { processWebhook } from 'corsair';

import { DEFAULT_TENANT } from '@/constants/gmail';
import { corsair } from '@/corsair';

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

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: Request) {
  let body: WebhookBody;

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
    const result = await processWebhook(
      corsair,
      Object.fromEntries(request.headers),
      body,
      {
        tenantId: url.searchParams.get('tenantId') ?? DEFAULT_TENANT,
      },
    );

    if (result.plugin) {
      console.log(`[webhook] handled by ${result.plugin}.${result.action}`);
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

// app/service/v1/sendEmail.ts  (UPDATED — adds replyToThread, shared dispatch)
// Send + reply through Corsair, then mirror the sent message into our DB.

import { desc, eq } from 'drizzle-orm';

import { DEFAULT_TENANT } from '@/constants/gmail';
import { corsair } from '@/corsair';
import { db } from '@/db';
import { emails } from '@/db/schema';
import { getOwnEmail } from '@/lib/v1/get-own-email';
import { buildMimeMessage, replySubject } from '@/lib/v1/mime';
import type { GmailMessage } from '@/lib/v1/parser';
import { ingestMessage } from '@/lib/v1/upsert';
import type { ReplyEmailInput, SendEmailInput } from '@/lib/schemas/v1/send-email';
import type { SendMessageResult } from '@/types/gmail';

export class SendEmailError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'SendEmailError';
  }
}

function dedupe(addresses: string[]): string[] {
  return [...new Set(addresses.map((address) => address.toLowerCase()))];
}

async function resolveFrom(): Promise<string> {
  const from = await getOwnEmail();
  if (!from) {
    throw new SendEmailError(
      'Could not determine your Gmail address. Set OWN_GMAIL_ADDRESS in .env or run a sync first.',
      500,
    );
  }
  return from;
}

// ---------------------------------------------------------------------------
// Shared: send the raw message, mirror it into our DB. One path for both
// compose and reply so mirroring/edge-case logic exists exactly once.
// ---------------------------------------------------------------------------

async function dispatchAndMirror(
  raw: string,
  from: string,
  threadId?: string,
  tenantId = DEFAULT_TENANT,
): Promise<SendMessageResult> {
  const tenant = corsair.withTenant(tenantId);

  let response;
  try {
    response = await tenant.gmail.api.messages.send(
      threadId ? { raw, threadId } : { raw },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gmail send failed';
    throw new SendEmailError(message, 502);
  }

  const id = response.id;
  const resultThreadId = response.threadId ?? response.id;

  if (!id || !resultThreadId) {
    throw new SendEmailError('Gmail did not return a message id', 502);
  }

  // The email is already sent — a mirror failure must never surface as a
  // send failure. The webhook or next sync picks it up (ingest is idempotent).
  try {
    let message = response as GmailMessage;

    if (!message.payload) {
      message = (await tenant.gmail.api.messages.get({
        id,
        format: 'full',
      })) as GmailMessage;
    }

    if (message.payload) {
      await ingestMessage(message, from);
    }
  } catch (error) {
    console.warn(`[send] sent ${id} but failed to mirror into DB:`, error);
  }

  return { id, threadId: resultThreadId };
}

// ---------------------------------------------------------------------------
// Compose (unchanged behavior)
// ---------------------------------------------------------------------------

export async function sendEmail(
  input: SendEmailInput,
  tenantId = DEFAULT_TENANT,
): Promise<SendMessageResult> {
  const from = await resolveFrom();

  const to = dedupe(input.to);
  const cc = dedupe(input.cc).filter((address) => !to.includes(address));

  const raw = buildMimeMessage({
    from,
    to,
    cc,
    subject: input.subject,
    bodyText: input.body,
  });

  return dispatchAndMirror(raw, from, undefined, tenantId);
}

// ---------------------------------------------------------------------------
// Reply to a thread
// ---------------------------------------------------------------------------

export async function replyToThread(
  threadId: string,
  input: ReplyEmailInput,
  tenantId = DEFAULT_TENANT,
): Promise<SendMessageResult> {
  const from = await resolveFrom();

  // Reply targets the LATEST message in the thread (Gmail behavior).
  // Read from our DB — no API call needed, we already have the headers.
  const [latest] = await db
    .select({
      fromEmail: emails.fromEmail,
      toEmails: emails.toEmails,
      ccEmails: emails.ccEmails,
      subject: emails.subject,
      isSent: emails.isSent,
      messageIdHeader: emails.messageIdHeader,
      referencesHeader: emails.referencesHeader,
    })
    .from(emails)
    .where(eq(emails.threadId, threadId))
    .orderBy(desc(emails.receivedAt))
    .limit(1);

  if (!latest) {
    throw new SendEmailError('Thread not found — sync it first', 404);
  }

  // Derive recipients:
  // - replying to a received message -> its sender
  // - replying to your OWN latest message (following up) -> its recipients
  const baseTo = latest.isSent ? (latest.toEmails ?? []) : [latest.fromEmail];
  let to = dedupe(baseTo).filter((address) => address !== from);

  // Edge case: self-thread (notes to yourself) — everyone filtered out above.
  if (to.length === 0) {
    to = [from];
  }

  // Reply-all: original to + cc, minus yourself, minus anyone already in `to`.
  let cc: string[] = [];
  if (input.mode === 'replyAll') {
    cc = dedupe([...(latest.toEmails ?? []), ...(latest.ccEmails ?? [])]).filter(
      (address) => address !== from && !to.includes(address),
    );
  }

  // Threading headers for the RECIPIENT's client. Gmail itself threads via
  // the threadId param, so a missing Message-Id header degrades gracefully.
  const inReplyTo = latest.messageIdHeader ?? undefined;
  const references =
    [latest.referencesHeader, latest.messageIdHeader]
      .filter(Boolean)
      .join(' ') || undefined;

  const raw = buildMimeMessage({
    from,
    to,
    cc,
    subject: replySubject(latest.subject),
    bodyText: input.body,
    inReplyTo,
    references,
  });

  return dispatchAndMirror(raw, from, threadId, tenantId);
}

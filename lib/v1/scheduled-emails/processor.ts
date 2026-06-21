// lib/v1/scheduled-emails/processor.ts
// Cron processor: claims due emails, sends them, handles retries.
// Called by /api/v1/scheduled-emails/process every 60 seconds.

import { claimDueEmails, markSent, markFailed, hasReceivedReply } from './queries';
import type { ScheduledEmail } from './types';

type ProcessResult = {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: string[];
};

export async function processDueEmails(): Promise<ProcessResult> {
  const result: ProcessResult = { processed: 0, sent: 0, failed: 0, skipped: 0, errors: [] };

  // Claim due emails atomically (prevents double-send across concurrent crons)
  const dueEmails = await claimDueEmails(10);

  if (dueEmails.length === 0) return result;

  console.log(`[scheduled-emails] processing ${dueEmails.length} due email(s)`);

  for (const email of dueEmails) {
    result.processed++;
    try {
      await processOne(email, result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[scheduled-emails] failed ${email.id}:`, errorMsg);
      result.errors.push(`${email.id}: ${errorMsg}`);
      result.failed++;

      try {
        await markFailed(email.id, errorMsg, email.retryCount + 1);
      } catch (markErr) {
        console.error(`[scheduled-emails] markFailed also failed for ${email.id}:`, markErr);
      }
    }
  }

  console.log(`[scheduled-emails] done: ${result.sent} sent, ${result.failed} failed, ${result.skipped} skipped`);
  return result;
}

// ---------------------------------------------------------------------------
// Process a single scheduled email
// ---------------------------------------------------------------------------

async function processOne(email: ScheduledEmail, result: ProcessResult): Promise<void> {
  // Follow-up type: check if reply was already received
  if (email.type === 'follow_up' && email.watchEmail) {
    const replyReceived = await hasReceivedReply(
      email.tenantId,
      email.watchEmail,
      email.createdAt,
    );

    if (replyReceived) {
      console.log(`[scheduled-emails] ${email.id}: reply received from ${email.watchEmail}, skipping follow-up`);
      await markSent(email.id); // Mark as "sent" (completed) — didn't actually send
      result.skipped++;
      return;
    }
  }

  // Send the email
  if (email.isReply && email.threadId) {
    await sendReply(email);
  } else {
    await sendNewEmail(email);
  }

  await markSent(email.id);
  result.sent++;
  console.log(`[scheduled-emails] ${email.id}: sent successfully`);
}

// ---------------------------------------------------------------------------
// Send a new email
// ---------------------------------------------------------------------------

async function sendNewEmail(email: ScheduledEmail): Promise<void> {
  // Dynamic import to avoid loading Corsair in the module graph at startup
  const { sendEmail } = await import('@/app/service/v1/sendEmail');

  await sendEmail(
    {
      to: email.toEmails,
      cc: email.ccEmails,
      subject: email.subject,
      body: email.body,
    },
    email.tenantId,
  );
}

// ---------------------------------------------------------------------------
// Reply to a thread
// ---------------------------------------------------------------------------

async function sendReply(email: ScheduledEmail): Promise<void> {
  const { replyToThread } = await import('@/app/service/v1/sendEmail');

  await replyToThread(
    email.threadId!,
    {
      body: email.body,
      mode: 'reply',
    },
    email.tenantId,
  );
}

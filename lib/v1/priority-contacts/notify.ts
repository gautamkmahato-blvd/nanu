// lib/v1/priority-contacts/notify.ts
// Called from the webhook handler when a new email arrives.
// Checks if the sender is a priority contact, sends Telegram notification if so.

import { isContactPriority, getNotificationSettings } from './db';
import { sendTelegramMessage, formatEmailNotification } from './telegram';

type IncomingEmail = {
  fromEmail: string;
  fromName?: string | null;
  subject?: string | null;
  snippet?: string | null;
};

export async function checkAndNotifyPriorityEmail(email: IncomingEmail, tenantId = 'default'): Promise<void> {
  try {
    // Step 1: Is the sender in the priority list?
    const contact = await isContactPriority(email.fromEmail, tenantId);
    if (!contact) {
      console.log(`[priority-notify] ${email.fromEmail} is NOT in priority list — skipping`);
      return;
    }
    console.log(`[priority-notify] ${email.fromEmail} IS priority — checking telegram...`);

    // Step 2: Is Telegram configured and enabled?
    const settings = await getNotificationSettings(tenantId);
    if (!settings.telegramEnabled) {
      console.log(`[priority-notify] telegram disabled — skipping`);
      return;
    }
    if (!settings.telegramBotToken || !settings.telegramChatId) {
      console.log(`[priority-notify] telegram not configured — token: ${!!settings.telegramBotToken}, chatId: ${!!settings.telegramChatId}`);
      return;
    }

    console.log(`[priority-notify] sending telegram notification...`);

    // Step 3: Send the notification
    const message = formatEmailNotification(
      email.fromName ?? contact.name,
      email.fromEmail,
      email.subject ?? null,
      email.snippet ?? null,
      contact.notes,
    );

    const result = await sendTelegramMessage(
      settings.telegramBotToken,
      settings.telegramChatId,
      message,
    );

    if (result.success) {
      console.log(`[priority-notify] Telegram sent for email from ${email.fromEmail}`);
    } else {
      console.warn(`[priority-notify] Telegram failed: ${result.error}`);
    }
  } catch (err) {
    // Never throw — this must not block webhook processing
    console.warn(`[priority-notify] error: ${err instanceof Error ? err.message : 'Unknown'}`);
  }
}
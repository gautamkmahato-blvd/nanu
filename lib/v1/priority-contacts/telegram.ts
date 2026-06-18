// lib/v1/priority-contacts/telegram.ts
// Telegram Bot API wrapper for sending notifications.
// Uses native fetch — no external dependencies.

type TelegramResult = { success: true } | { success: false; error: string };

const TELEGRAM_API = 'https://api.telegram.org';
const SEND_TIMEOUT_MS = 10_000; // 10 seconds

export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string,
): Promise<TelegramResult> {
  if (!botToken || !chatId) {
    return { success: false, error: 'Telegram bot token or chat ID not configured' };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);

    const res = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const errMsg = (data as Record<string, unknown>).description ?? `HTTP ${res.status}`;
      console.warn(`[telegram] send failed: ${errMsg}`);
      return { success: false, error: String(errMsg) };
    }

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.warn(`[telegram] send error: ${msg}`);
    return { success: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Format email notification message
// ---------------------------------------------------------------------------

export function formatEmailNotification(
  senderName: string | null,
  senderEmail: string,
  subject: string | null,
  snippet: string | null,
  contactNotes: string | null,
): string {
  const name = senderName || senderEmail.split('@')[0];
  const subj = subject || '(no subject)';
  const preview = snippet ? snippet.slice(0, 200) : '';

  let message = `🔔 <b>Priority Email</b>\n\n`;
  message += `<b>From:</b> ${escapeHtml(name)} &lt;${escapeHtml(senderEmail)}&gt;\n`;
  message += `<b>Subject:</b> ${escapeHtml(subj)}\n`;

  if (preview) {
    message += `\n${escapeHtml(preview)}`;
    if (preview.length >= 200) message += '...';
  }

  if (contactNotes) {
    message += `\n\n📌 <i>${escapeHtml(contactNotes)}</i>`;
  }

  return message;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

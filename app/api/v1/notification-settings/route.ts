// app/api/v1/notification-settings/route.ts
// GET   → get current notification settings
// PATCH → update notification settings
// POST  → test telegram connection

import { NextRequest, NextResponse } from 'next/server';
import { getNotificationSettings, updateNotificationSettings } from '@/lib/v1/priority-contacts/db';
import { sendTelegramMessage } from '@/lib/v1/priority-contacts/telegram';
import { getTenantId } from '@/lib/auth/session';

export async function GET() {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await getNotificationSettings(tenantId);
    // Mask the bot token for security (show last 6 chars only)
    return NextResponse.json({
      ...settings,
      telegramBotToken: settings.telegramBotToken
        ? `***${settings.telegramBotToken.slice(-6)}`
        : null,
    });
  } catch (err) {
    console.error('[notification-settings GET]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if (body.telegramBotToken !== undefined) updates.telegramBotToken = body.telegramBotToken;
    if (body.telegramChatId !== undefined) updates.telegramChatId = body.telegramChatId;
    if (body.telegramEnabled !== undefined) updates.telegramEnabled = body.telegramEnabled;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const settings = await updateNotificationSettings(updates, tenantId);
    return NextResponse.json({
      ...settings,
      telegramBotToken: settings.telegramBotToken
        ? `***${settings.telegramBotToken.slice(-6)}`
        : null,
    });
  } catch (err) {
    console.error('[notification-settings PATCH]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}

// POST → test telegram connection by sending a test message
export async function POST() {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await getNotificationSettings(tenantId);

    if (!settings.telegramBotToken || !settings.telegramChatId) {
      return NextResponse.json({ error: 'Telegram bot token and chat ID required' }, { status: 400 });
    }

    const result = await sendTelegramMessage(
      settings.telegramBotToken,
      settings.telegramChatId,
      '✅ <b>Context Mode</b> — Telegram notifications connected successfully!',
    );

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Test message sent!' });
    }
    return NextResponse.json({ error: result.error }, { status: 400 });
  } catch (err) {
    console.error('[notification-settings POST]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}

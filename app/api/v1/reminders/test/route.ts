// app/api/v1/reminders/test/route.ts
// Auth required — triggers a test Vapi call to verify setup.
// Rate limited: 1 test call per 5 minutes per tenant.

import { NextResponse } from 'next/server';
import { getTenantId, getSession } from '@/lib/auth/session';
import { countRecentCalls, getReminderSettings, triggerReminderCall } from '@/lib/v1/vapi';

import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

export async function POST(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = await rateLimit(request, apiLimiter, tenantId); if (rl) return rl;

  const settings = await getReminderSettings(tenantId);
  if (!settings?.phoneNumber) {
    return NextResponse.json({ error: 'Phone number not configured' }, { status: 400 });
  }

  if (!settings.callEnabled) {
    return NextResponse.json({ error: 'Call reminders are not enabled' }, { status: 400 });
  }

  // Rate limit: max 3 test calls per hour
  const recentCalls = await countRecentCalls(tenantId);
  if (recentCalls >= 3) {
    return NextResponse.json({ error: 'Too many test calls. Try again later.' }, { status: 429 });
  }

  try {
    const session = await getSession();
    const userName = session?.name || 'there';

    const testMeeting = {
      id: `test-${Date.now()}`,
      summary: 'Test Meeting Reminder',
      startTime: new Date(Date.now() + 5 * 60000).toISOString(),
      endTime: new Date(Date.now() + 35 * 60000).toISOString(),
      attendees: ['Test Colleague'],
      hangoutLink: 'https://meet.google.com/test',
      minutesUntilStart: 5,
    };

    const { callId } = await triggerReminderCall(settings.phoneNumber, userName, testMeeting);

    return NextResponse.json({
      success: true,
      message: `Test call triggered to ${settings.phoneNumber}`,
      callId,
    });
  } catch (error) {
    console.error('[reminders:test] failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test call failed' },
      { status: 500 },
    );
  }
}

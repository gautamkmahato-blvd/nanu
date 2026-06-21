// app/api/v1/reminders/settings/route.ts
// Auth required — user configures phone number and reminder preferences.

import { NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/session';
import { formatZodError, getReminderSettings, reminderSettingsSchema, upsertReminderSettings } from '@/lib/v1/vapi';
import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

export async function GET(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


  const rl = await rateLimit(request, apiLimiter, tenantId); if (rl) return rl;


  const settings = await getReminderSettings(tenantId);
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const result = reminderSettingsSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: formatZodError(result.error) }, { status: 400 });
    }

    const settings = await upsertReminderSettings(tenantId, result.data);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('[reminders:settings] update failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 },
    );
  }
}

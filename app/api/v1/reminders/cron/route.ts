// app/api/v1/reminders/cron/route.ts
// Internal endpoint called by the scheduler process every 60 seconds.
// Secured with CRON_SECRET header — not accessible from browser.

import { runSchedulerTick } from '@/lib/v1/vapi';
import { NextRequest, NextResponse } from 'next/server';

const CRON_SECRET = process.env.CRON_SECRET || '';

export async function GET(req: NextRequest) {
  // Verify cron secret — prevents external access
  const secret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret');

  if (!CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }

  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runSchedulerTick();

    console.log(
      `[reminder:cron] tick: ${result.tenantsChecked} tenants, ${result.callsTriggered} calls` +
      (result.errors.length > 0 ? `, ${result.errors.length} errors` : ''),
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('[reminder:cron] failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scheduler failed' },
      { status: 500 },
    );
  }
}

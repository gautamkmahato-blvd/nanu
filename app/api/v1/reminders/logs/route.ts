// app/api/v1/reminders/logs/route.ts
// Auth required — view recent reminder call history.

import { NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/session';
import { getRecentLogs } from '@/lib/v1/vapi';

export async function GET() {
  const tenantId = await getTenantId();
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const logs = await getRecentLogs(tenantId, 20);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('[reminders:logs] failed:', error);
    return NextResponse.json({ error: 'Failed to load logs' }, { status: 500 });
  }
}

// app/api/v1/calendar/availability/route.ts
// GET: Check free/busy availability.
// Query params: ?start=ISO&end=ISO (defaults to today → +3 days)

import { NextResponse } from 'next/server';
import { getAvailability } from '@/lib/v1/calendar/availability';
import { getTenantId } from '@/lib/auth/session';

export async function GET(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const defaultEnd = new Date(startOfToday);
    defaultEnd.setDate(defaultEnd.getDate() + 3);

    const timeMin = searchParams.get('start') ?? startOfToday.toISOString();
    const timeMax = searchParams.get('end') ?? defaultEnd.toISOString();

    if (isNaN(new Date(timeMin).getTime()) || isNaN(new Date(timeMax).getTime())) {
      return NextResponse.json({ error: 'Invalid date format. Use ISO strings.' }, { status: 400 });
    }

    const availability = await getAvailability(timeMin, timeMax, tenantId);

    return NextResponse.json(availability);
  } catch (error) {
    console.error('[calendar] availability check failed:', error);
    const msg = error instanceof Error ? error.message : 'Failed';

    return NextResponse.json(
      { error: `Failed to check availability: ${msg}` },
      { status: 500 },
    );
  }
}

// app/api/v1/booking/bookings/route.ts
// Auth required — host views their bookings.

import { NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/session';
import { getBookingsForTenant } from '@/lib/v1/booking/queries';
import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

export async function GET(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = await rateLimit(request, apiLimiter, tenantId); if (rl) return rl;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? undefined;

  try {
    const bookings = await getBookingsForTenant(tenantId, status);
    return NextResponse.json({ bookings, total: bookings.length });
  } catch (error) {
    console.error('[booking:list] failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 },
    );
  }
}

// app/api/v1/settings/usage/route.ts
// GET: returns current usage stats and limits

import { NextRequest, NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/session';
import { getUsageLimits } from '@/lib/v1/user-settings';
import { authLimiter } from '@/lib/utils/rate-limit';
import { rateLimit, getClientIp } from '@/lib/utils/rate-limit/check';
export async function GET(request: NextRequest) {
  const tenantId = await getTenantId();
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = await rateLimit(request, authLimiter, getClientIp(request)); if (rl) return rl;
  try {
    const limits = await getUsageLimits(tenantId);
    return NextResponse.json(limits);
  } catch (error) {
    console.error('[settings:usage] failed:', error);
    return NextResponse.json({ error: 'Failed to load usage' }, { status: 500 });
  }
}

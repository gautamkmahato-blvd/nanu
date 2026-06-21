// app/api/v1/dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getDashboardEmails } from '@/lib/v1/queries/dashboard';
import { computeDashboard } from '@/lib/v1/dashboard';
import { getTenantId } from '@/lib/auth/session';
import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

export async function GET(request: NextRequest) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


  const rl = await rateLimit(request, apiLimiter, tenantId); if (rl) return rl;

  try {
    const emails = await getDashboardEmails(tenantId);
    const dashboard = computeDashboard(emails);
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('[dashboard] failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load dashboard' },
      { status: 500 },
    );
  }
}

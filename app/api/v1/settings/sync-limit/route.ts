// app/api/v1/settings/sync-limit/route.ts
// PUT: update sync limit (only for BYOK users)

import { NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/session';
import { FREE_SYNC_LIMIT, hasByokKey, MAX_SYNC_LIMIT, updateSyncLimit } from '@/lib/v1/user-settings';
import { authLimiter } from '@/lib/utils/rate-limit';
import { rateLimit, getClientIp } from '@/lib/utils/rate-limit/check';
export async function PUT(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = await rateLimit(request, authLimiter, getClientIp(request)); if (rl) return rl;
  try {
    const isByok = await hasByokKey(tenantId);
    if (!isByok) {
      return NextResponse.json(
        { error: `Sync limit is fixed at ${FREE_SYNC_LIMIT} on the free tier. Add your API key to customize.` },
        { status: 403 },
      );
    }

    const body = await request.json();
    const limit = Number(body.syncLimit);

    if (!Number.isFinite(limit) || limit < 1 || limit > MAX_SYNC_LIMIT) {
      return NextResponse.json(
        { error: `Sync limit must be between 1 and ${MAX_SYNC_LIMIT}` },
        { status: 400 },
      );
    }

    await updateSyncLimit(tenantId, Math.round(limit));
    return NextResponse.json({ success: true, syncLimit: Math.round(limit) });
  } catch (error) {
    console.error('[settings:sync-limit] failed:', error);
    return NextResponse.json({ error: 'Failed to update sync limit' }, { status: 500 });
  }
}

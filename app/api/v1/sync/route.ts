// app/api/v1/sync/route.ts
// UPDATED: dynamic sync limit based on BYOK status

import { syncThreads, syncThreadsBackground, getSyncStatus } from '@/app/service/v1/syncThreads';
import { NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/session';
import { getSyncLimit } from '@/lib/v1/user-settings';
import { syncLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

const BACKGROUND_THRESHOLD = 50;

export async function POST(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


const rl = await rateLimit(request, syncLimiter, tenantId); if (rl) return rl;

  // Get the user's max sync limit
  const maxAllowed = await getSyncLimit(tenantId);

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Number(limitParam) : maxAllowed;

  if (!Number.isFinite(limit) || limit < 1 || limit > maxAllowed) {
    return NextResponse.json(
      { error: `Sync limit must be between 1 and ${maxAllowed}. ${maxAllowed <= 20 ? 'Add your API key in Settings to increase the limit.' : ''}` },
      { status: 400 },
    );
  }

  if (limit > BACKGROUND_THRESHOLD) {
    const currentStatus = getSyncStatus(tenantId);
    if (currentStatus.status === 'syncing') {
      return NextResponse.json({ message: 'Sync already in progress', ...currentStatus });
    }

    syncThreadsBackground(limit, tenantId).catch((err) =>
      console.error('[sync] background sync failed:', err),
    );

    return NextResponse.json({
      message: `Background sync started for ${limit} threads. Poll GET /api/v1/sync for progress.`,
      status: 'syncing',
      limit,
    });
  }

  try {
    const result = await syncThreads(limit, tenantId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[sync] route failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 },
    );
  }
}

export async function GET() {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = getSyncStatus(tenantId);
  return NextResponse.json(status);
}

// app/api/v1/sync/route.ts
// POST: Start a Gmail sync.
//   - limit ≤ 50  → synchronous, returns results when done
//   - limit > 50  → background pipeline, returns immediately with status
//
// GET: Check sync progress (polls background sync state).

import { syncThreads, syncThreadsBackground, getSyncStatus } from '@/app/service/v1/syncThreads';
import { NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/session';

// Background sync threshold — above this, sync runs in background
const BACKGROUND_THRESHOLD = 50;

export async function POST(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Number(limitParam) : 25;

  if (!Number.isFinite(limit) || limit < 1 || limit > 500) {
    return NextResponse.json(
      { error: 'limit must be a number between 1 and 500' },
      { status: 400 },
    );
  }

  // Large sync → fire in background, return immediately
  if (limit > BACKGROUND_THRESHOLD) {
    const currentStatus = getSyncStatus(tenantId);

    // Don't start another sync if one is already running
    if (currentStatus.status === 'syncing') {
      return NextResponse.json({
        message: 'Sync already in progress',
        ...currentStatus,
      });
    }

    // Fire-and-forget — runs in background, progress via GET /api/v1/sync
    syncThreadsBackground(limit, tenantId).catch((err) =>
      console.error('[sync] background sync failed:', err),
    );

    return NextResponse.json({
      message: `Background sync started for ${limit} threads. Poll GET /api/v1/sync for progress.`,
      status: 'syncing',
      limit,
    });
  }

  // Small sync → synchronous, return results
  try {
    const result = await syncThreads(limit, tenantId);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to sync threads';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET: Poll sync progress
// ---------------------------------------------------------------------------

export async function GET() {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = getSyncStatus(tenantId);
  return NextResponse.json(status);
}

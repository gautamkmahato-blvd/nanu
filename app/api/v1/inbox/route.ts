import { getInboxThreads } from '@/lib/v1/queries/inbox';
import { NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/session';

export async function GET(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') ?? 50);
  const offset = Number(searchParams.get('offset') ?? 0);

  try {
    const threads = await getInboxThreads(limit, offset, tenantId);
    return NextResponse.json(threads);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load inbox';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

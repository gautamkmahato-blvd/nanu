import { NextRequest, NextResponse } from 'next/server';

import { getThreadMessages } from '@/lib/v1/queries/thread';
import { getTenantId } from '@/lib/auth/session';
import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


const rl = await rateLimit(_request, apiLimiter, tenantId); if (rl) return rl;

  const { threadId } = await params;

  if (!threadId || !/^[a-zA-Z0-9_-]+$/.test(threadId)) {
    return NextResponse.json({ error: 'Invalid thread id' }, { status: 400 });
  }

  try {
    const messages = await getThreadMessages(threadId, tenantId);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('[thread] failed to load messages:', error);
    return NextResponse.json(
      { error: 'Failed to load thread' },
      { status: 500 },
    );
  }
}

// app/api/v1/ai-chat/embed/route.ts
// Trigger batch embedding for all unembedded emails.
// POST /api/v1/ai-chat/embed

import { NextRequest, NextResponse } from 'next/server';
import { embedPendingEmails } from '@/lib/v1/ai-chat/embeddings/batch';
import { getTenantId } from '@/lib/auth/session';
import { aiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

export async function POST(request: NextRequest) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


// add inside each handler: 
const rl = await rateLimit(request, aiLimiter, tenantId); if (rl) return rl;

  try {
    const stats = await embedPendingEmails(tenantId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('[embed] route failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Embedding failed' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}

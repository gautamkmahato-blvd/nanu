// app/api/v1/ai/process/route.ts
// Manual trigger + cron sweep for the classifier.
// curl -X POST localhost:3000/api/v1/ai/process

import { NextRequest, NextResponse } from 'next/server';

import { classifySyncedEmails } from '@/lib/v1/ai/classify';
import { getTenantId } from '@/lib/auth/session';
import { aiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


// add inside each handler: 
const rl = await rateLimit(request, aiLimiter, tenantId); if (rl) return rl;

  try {
    const stats = await classifySyncedEmails(tenantId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('[ai] process route failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Classification failed' },
      { status: 500 },
    );
  }
}

// Vercel Cron sends GET
export async function GET(request: NextRequest) {
  return POST(request);
}

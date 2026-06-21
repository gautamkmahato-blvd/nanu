// app/api/v1/ai-agent/route.ts
// UPDATED: adds usage limit check + BYOK client support

import { NextResponse } from 'next/server';
import { runAgent } from '@/lib/v1/ai-agent/agent';
import type { AgentRequest } from '@/lib/v1/ai-agent/types';
import { getTenantId } from '@/lib/auth/session';
import { checkAndConsumeChat } from '@/lib/v1/user-settings';
import { aiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';
export const maxDuration = 60;

export async function POST(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


  // add inside each handler: 
  const rl = await rateLimit(request, aiLimiter, tenantId); if (rl) return rl;

  try {
    const body = (await request.json()) as AgentRequest;
    if (!body.message && !body.pendingAction) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // Check usage limit (skip for confirmation follow-ups — they're part of an already-counted interaction)
    if (!body.pendingAction) {
      const usage = await checkAndConsumeChat(tenantId, 'agent');
      if (!usage.allowed) {
        return NextResponse.json({
          status: 'error',
          message: usage.error,
          toolsUsed: [],
          limitReached: true,
        }, { status: 429 });
      }
    }

    const result = await runAgent({ ...body, tenantId });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[ai-agent] route error:', error);
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Internal error', toolsUsed: [] },
      { status: 500 },
    );
  }
}

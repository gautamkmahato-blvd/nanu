// app/api/v1/ai-agent/route.ts
import { NextResponse } from 'next/server';
import { runAgent } from '@/lib/v1/ai-agent/agent';
import type { AgentRequest } from '@/lib/v1/ai-agent/types';
import { getTenantId } from '@/lib/auth/session';

export const maxDuration = 60;
const MODEL = 'anthropic/claude-sonnet-4-6';

export async function POST(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as AgentRequest;
    if (!body.message && !body.pendingAction) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
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

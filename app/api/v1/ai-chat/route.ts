// app/api/v1/ai-chat/route.ts
// UPDATED: adds usage limit check

import { NextResponse } from 'next/server';
import { handleChatQuery } from '@/lib/v1/ai-chat';
import { getTenantId } from '@/lib/auth/session';
import { checkAndConsumeChat } from '@/lib/v1/user-settings';
import { aiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

export async function POST(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


  // add inside each handler: 
  const rl = await rateLimit(request, aiLimiter, tenantId); if (rl) return rl;

  try {
    const body = await request.json();
    const message = body.message;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 chars)' }, { status: 400 });
    }

    // Check usage limit
    const usage = await checkAndConsumeChat(tenantId, 'search');
    if (!usage.allowed) {
      return NextResponse.json({ error: usage.error, limitReached: true }, { status: 429 });
    }

    const result = await handleChatQuery(message.trim(), { tenantId });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[ai-chat] route failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chat query failed' },
      { status: 500 },
    );
  }
}

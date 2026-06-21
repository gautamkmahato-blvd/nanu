// app/api/v1/email-assistant/route.ts
// UPDATED: adds usage limit check

import { NextResponse } from 'next/server';
import { askAboutEmail } from '@/lib/v1/email-assistant';
import type { ChatHistoryMessage } from '@/lib/v1/email-assistant';
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
    const { emailId, message, history } = body;

    if (!emailId || typeof emailId !== 'string') {
      return NextResponse.json({ error: 'emailId is required' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 chars)' }, { status: 400 });
    }

    // Check usage limit
    const usage = await checkAndConsumeChat(tenantId, 'assistant');
    if (!usage.allowed) {
      return NextResponse.json({ error: usage.error, limitReached: true }, { status: 429 });
    }

    const validHistory: ChatHistoryMessage[] = Array.isArray(history)
      ? history.filter(
        (h: unknown) =>
          h && typeof h === 'object' &&
          typeof (h as Record<string, unknown>).role === 'string' &&
          typeof (h as Record<string, unknown>).content === 'string',
      )
      : [];

    const result = await askAboutEmail(emailId, message.trim(), validHistory, tenantId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[email-assistant] route failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 },
    );
  }
}

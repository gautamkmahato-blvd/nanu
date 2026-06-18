// app/api/v1/ai-chat/route.ts

import { NextResponse } from 'next/server';
import { handleChatQuery } from '@/lib/v1/ai-chat';
import { getTenantId } from '@/lib/auth/session';

export async function POST(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const message = body.message;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 chars)' }, { status: 400 });
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

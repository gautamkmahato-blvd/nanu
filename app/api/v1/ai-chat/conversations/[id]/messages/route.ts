// app/api/v1/ai-chat/conversations/[id]/messages/route.ts
// POST /api/v1/ai-chat/conversations/:id/messages → add message(s)
//
// Accepts single message or batch (user + assistant pair).
// This is called AFTER the AI agent responds, to persist both sides.

import { NextRequest, NextResponse } from 'next/server';
import {
  addMessage,
  getConversation,
  updateConversationTitle,
  generateTitle,
} from '@/lib/v1/ai-chat/conversations';
import { getTenantId } from '@/lib/auth/session';
import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';  

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


const rl = await rateLimit(req, apiLimiter, tenantId); if (rl) return rl;

  try {
    const { id } = await params;
    const body = await req.json();

    // Validate conversation exists
    const conv = await getConversation(id, tenantId);
    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Support batch: { messages: [...] } or single: { role, content, ... }
    const messages = body.messages ?? [body];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'At least one message required' }, { status: 400 });
    }

    const savedIds: string[] = [];

    for (const msg of messages) {
      if (!msg.role || !['user', 'assistant'].includes(msg.role)) {
        return NextResponse.json({ error: `Invalid role: ${msg.role}` }, { status: 400 });
      }

      const msgId = await addMessage(
        id,
        msg.role,
        msg.content ?? '',
        msg.emails ?? null,
        msg.toolsUsed ?? null,
        tenantId,
      );

      savedIds.push(msgId);
    }

    // Auto-generate title from first user message if title is still default
    if (conv.title === 'New Chat' && conv.messageCount === 0) {
      const firstUserMsg = messages.find((m: any) => m.role === 'user');
      if (firstUserMsg?.content) {
        const title = generateTitle(firstUserMsg.content);
        await updateConversationTitle(id, title, tenantId);
      }
    }

    return NextResponse.json({ savedIds, count: savedIds.length });
  } catch (err) {
    console.error('[ai-chat/messages POST]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to save messages' },
      { status: 500 }
    );
  }
}

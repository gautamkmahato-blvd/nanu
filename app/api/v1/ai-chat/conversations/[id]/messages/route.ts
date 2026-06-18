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

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Validate conversation exists
    const conv = await getConversation(id);
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
      );

      savedIds.push(msgId);
    }

    // Auto-generate title from first user message if title is still default
    if (conv.title === 'New Chat' && conv.messageCount === 0) {
      const firstUserMsg = messages.find((m: any) => m.role === 'user');
      if (firstUserMsg?.content) {
        const title = generateTitle(firstUserMsg.content);
        await updateConversationTitle(id, title);
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

// app/api/v1/ai-chat/conversations/[id]/route.ts
// GET    /api/v1/ai-chat/conversations/:id   → get conversation + messages
// PATCH  /api/v1/ai-chat/conversations/:id   → update title
// DELETE /api/v1/ai-chat/conversations/:id   → delete conversation

import { NextRequest, NextResponse } from 'next/server';
import { getConversation, updateConversationTitle, deleteConversation } from '@/lib/v1/ai-chat/conversations';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const conversation = await getConversation(id);

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (err) {
    console.error('[ai-chat/conversations/[id] GET]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    await updateConversationTitle(id, body.title);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[ai-chat/conversations/[id] PATCH]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteConversation(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[ai-chat/conversations/[id] DELETE]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}

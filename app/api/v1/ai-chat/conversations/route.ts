// app/api/v1/ai-chat/conversations/route.ts
// GET  /api/v1/ai-chat/conversations         → list all conversations
// POST /api/v1/ai-chat/conversations         → create new conversation

import { NextRequest, NextResponse } from 'next/server';
import { listConversations, createConversation, generateTitle } from '@/lib/v1/ai-chat/conversations';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100);

    const conversations = await listConversations(limit);
    return NextResponse.json({ conversations });
  } catch (err) {
    console.error('[ai-chat/conversations GET]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to list conversations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = body.title ? generateTitle(body.title) : undefined;

    const id = await createConversation(title);
    return NextResponse.json({ id, title: title ?? 'New Chat' });
  } catch (err) {
    console.error('[ai-chat/conversations POST]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

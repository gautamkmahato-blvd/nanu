// lib/v1/ai-chat/conversations.ts
// DB operations for AI chat conversation persistence.
// Auto-creates tables on first use.

import { sql } from 'drizzle-orm';
import { db } from '@/db';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Conversation = {
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ConversationMessage = {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  emails: any[] | null;
  toolsUsed: string[] | null;
  createdAt: string;
};

export type ConversationWithMessages = Conversation & {
  messages: ConversationMessage[];
};

// ---------------------------------------------------------------------------
// Ensure tables exist (auto-create on first use)
// ---------------------------------------------------------------------------

let tablesChecked = false;

async function ensureTables(): Promise<void> {
  if (tablesChecked) return;

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT NOT NULL DEFAULT 'New Chat',
        message_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ai_chat_messages (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        conversation_id TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL DEFAULT '',
        emails JSONB,
        tools_used TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_conv
      ON ai_chat_messages(conversation_id, created_at)
    `);

    tablesChecked = true;
  } catch (err) {
    console.warn('[ai-chat] Could not create tables:', err);
  }
}

// ---------------------------------------------------------------------------
// List conversations (most recent first)
// ---------------------------------------------------------------------------

export async function listConversations(limit = 50): Promise<Conversation[]> {
  await ensureTables();

  const rows = await db.execute(sql`
    SELECT id, title, message_count, created_at, updated_at
    FROM ai_conversations
    ORDER BY updated_at DESC
    LIMIT ${limit}
  `);

  return rows.rows.map((r: any) => ({
    id: String(r.id),
    title: String(r.title),
    messageCount: Number(r.message_count),
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// Get single conversation with all messages
// ---------------------------------------------------------------------------

export async function getConversation(id: string): Promise<ConversationWithMessages | null> {
  await ensureTables();

  // Fetch conversation
  const convRows = await db.execute(sql`
    SELECT id, title, message_count, created_at, updated_at
    FROM ai_conversations
    WHERE id = ${id}
    LIMIT 1
  `);

  if (convRows.rows.length === 0) return null;

  const conv = convRows.rows[0] as any;

  // Fetch messages
  const msgRows = await db.execute(sql`
    SELECT id, conversation_id, role, content, emails, tools_used, created_at
    FROM ai_chat_messages
    WHERE conversation_id = ${id}
    ORDER BY created_at ASC
  `);

  const messages: ConversationMessage[] = msgRows.rows.map((r: any) => ({
    id: String(r.id),
    conversationId: String(r.conversation_id),
    role: r.role as 'user' | 'assistant',
    content: String(r.content),
    emails: r.emails ?? null,
    toolsUsed: r.tools_used ?? null,
    createdAt: new Date(r.created_at).toISOString(),
  }));

  return {
    id: String(conv.id),
    title: String(conv.title),
    messageCount: Number(conv.message_count),
    createdAt: new Date(conv.created_at).toISOString(),
    updatedAt: new Date(conv.updated_at).toISOString(),
    messages,
  };
}

// ---------------------------------------------------------------------------
// Create a new conversation
// ---------------------------------------------------------------------------

export async function createConversation(title?: string): Promise<string> {
  await ensureTables();

  const displayTitle = title?.trim().slice(0, 100) || 'New Chat';

  const rows = await db.execute(sql`
    INSERT INTO ai_conversations (title)
    VALUES (${displayTitle})
    RETURNING id
  `);

  return String(rows.rows[0].id);
}

// ---------------------------------------------------------------------------
// Add a message to a conversation
// ---------------------------------------------------------------------------

export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  emails?: any[] | null,
  toolsUsed?: string[] | null,
): Promise<string> {
  await ensureTables();

  const emailsJson = emails && emails.length > 0 ? JSON.stringify(emails) : null;
const toolsArray = toolsUsed && toolsUsed.length > 0
  ? sql.raw(`ARRAY[${toolsUsed.map((t) => `'${t.replace(/'/g, "''")}'`).join(',')}]::text[]`)
  : sql`NULL`;

const rows = await db.execute(sql`
  INSERT INTO ai_chat_messages (conversation_id, role, content, emails, tools_used)
  VALUES (
    ${conversationId},
    ${role},
    ${content},
    ${emailsJson ? sql`${emailsJson}::jsonb` : sql`NULL`},
    ${toolsArray}
  )
  RETURNING id
`);

  // Update conversation: bump message_count and updated_at
  await db.execute(sql`
    UPDATE ai_conversations
    SET message_count = message_count + 1,
        updated_at = NOW()
    WHERE id = ${conversationId}
  `);

  return String(rows.rows[0].id);
}

// ---------------------------------------------------------------------------
// Update conversation title
// ---------------------------------------------------------------------------

export async function updateConversationTitle(id: string, title: string): Promise<void> {
  await ensureTables();

  await db.execute(sql`
    UPDATE ai_conversations
    SET title = ${title.trim().slice(0, 100)},
        updated_at = NOW()
    WHERE id = ${id}
  `);
}

// ---------------------------------------------------------------------------
// Auto-generate title from first user message
// ---------------------------------------------------------------------------

export function generateTitle(firstMessage: string): string {
  const clean = firstMessage.trim().replace(/\n/g, ' ');
  if (clean.length <= 60) return clean;
  return clean.slice(0, 57) + '...';
}

// ---------------------------------------------------------------------------
// Delete a conversation (cascade deletes messages)
// ---------------------------------------------------------------------------

export async function deleteConversation(id: string): Promise<void> {
  await ensureTables();

  await db.execute(sql`
    DELETE FROM ai_conversations WHERE id = ${id}
  `);
}

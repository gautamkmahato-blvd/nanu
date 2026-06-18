import { sql } from 'drizzle-orm';

import { db } from '@/db';

export type InboxThread = {
  threadId: string;
  subject: string | null;
  fromEmail: string;
  fromName: string | null;
  snippet: string | null;
  receivedAt: string;
  isRead: boolean;
  messageCount: number;
  hasUnread: boolean;
};

type InboxThreadRow = {
  thread_id: string;
  subject: string | null;
  from_email: string;
  from_name: string | null;
  snippet: string | null;
  received_at: Date | string;
  is_read: boolean;
  message_count: number;
  has_unread: boolean;
};

export async function getInboxThreads(
  limit = 50,
  offset = 0,
  tenantId = 'default',
): Promise<InboxThread[]> {
  const result = await db.execute(sql`
    WITH latest AS (
      SELECT DISTINCT ON (thread_id)
        thread_id,
        subject,
        from_email,
        from_name,
        snippet,
        received_at,
        is_read
      FROM emails
      WHERE tenant_id = ${tenantId}
        AND is_archived = false
      ORDER BY thread_id, received_at DESC
    ),
    stats AS (
      SELECT
        thread_id,
        COUNT(*)::int AS message_count,
        bool_or(NOT is_read) AS has_unread
      FROM emails
      WHERE tenant_id = ${tenantId}
        AND is_archived = false
      GROUP BY thread_id
    )
    SELECT
      l.thread_id,
      l.subject,
      l.from_email,
      l.from_name,
      l.snippet,
      l.received_at,
      l.is_read,
      s.message_count,
      s.has_unread
    FROM latest l
    INNER JOIN stats s ON s.thread_id = l.thread_id
    ORDER BY l.received_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return (result.rows as InboxThreadRow[]).map((row) => ({
    threadId: row.thread_id,
    subject: row.subject,
    fromEmail: row.from_email,
    fromName: row.from_name,
    snippet: row.snippet,
    receivedAt: new Date(row.received_at).toISOString(),
    isRead: row.is_read,
    messageCount: row.message_count,
    hasUnread: row.has_unread,
  }));
}
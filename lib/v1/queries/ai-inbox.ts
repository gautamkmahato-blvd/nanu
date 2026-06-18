// lib/v1/queries/ai-inbox.ts
// AI-enriched inbox query with optional time period filter.

import { sql } from 'drizzle-orm';
import { db } from '@/db';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AIInboxThread = {
  id: string;
  threadId: string;
  subject: string | null;
  fromEmail: string;
  fromName: string | null;
  snippet: string | null;
  receivedAt: string;
  isRead: boolean;
  status: string;
  messageCount: number;
  hasUnread: boolean;
  hasAttachments: boolean;
  aiAnalysis: Record<string, any> | null;
};

export type TimePeriod = 'today' | '3days' | 'week' | '15days' | 'month' | 'all';

// ---------------------------------------------------------------------------
// Helper: convert time period to cutoff date
// ---------------------------------------------------------------------------

function getTimeFilterDate(period: TimePeriod): Date | null {
  if (period === 'all') return null;

  const now = new Date();
  const cutoff = new Date(now);

  switch (period) {
    case 'today':
      cutoff.setHours(0, 0, 0, 0);
      break;
    case '3days':
      cutoff.setDate(cutoff.getDate() - 3);
      cutoff.setHours(0, 0, 0, 0);
      break;
    case 'week':
      cutoff.setDate(cutoff.getDate() - 7);
      cutoff.setHours(0, 0, 0, 0);
      break;
    case '15days':
      cutoff.setDate(cutoff.getDate() - 15);
      cutoff.setHours(0, 0, 0, 0);
      break;
    case 'month':
      cutoff.setMonth(cutoff.getMonth() - 1);
      cutoff.setHours(0, 0, 0, 0);
      break;
  }

  return cutoff;
}

// ---------------------------------------------------------------------------
// Main query
// ---------------------------------------------------------------------------

export async function getAIInboxThreads(
  limit = 50,
  offset = 0,
  timePeriod: TimePeriod = 'all',
  tenantId = 'default',
): Promise<AIInboxThread[]> {
  const cutoffDate = getTimeFilterDate(timePeriod);

  const timeClause = cutoffDate
    ? sql`AND received_at >= ${cutoffDate.toISOString()}`
    : sql``;

  const result = await db.execute(sql`
    WITH latest AS (
      SELECT DISTINCT ON (thread_id)
        id,
        thread_id,
        subject,
        from_email,
        from_name,
        snippet,
        received_at,
        is_read,
        status,
        ai_analysis
      FROM emails
      WHERE tenant_id = ${tenantId}
        AND is_archived = false
        ${timeClause}
      ORDER BY thread_id, received_at DESC
    ),
    stats AS (
      SELECT
        thread_id,
        COUNT(*)::int AS message_count,
        bool_or(NOT is_read) AS has_unread,
        bool_or(has_attachments) AS thread_has_attachments
      FROM emails
      WHERE tenant_id = ${tenantId}
        AND is_archived = false
      GROUP BY thread_id
    )
    SELECT
      l.*,
      s.message_count,
      s.has_unread,
      s.thread_has_attachments
    FROM latest l
    INNER JOIN stats s ON s.thread_id = l.thread_id
    ORDER BY l.received_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return (result.rows as Record<string, any>[]).map((row) => ({
    id: String(row.id),
    threadId: String(row.thread_id),
    subject: row.subject ?? null,
    fromEmail: String(row.from_email),
    fromName: row.from_name ?? null,
    snippet: row.snippet ?? null,
    receivedAt: new Date(row.received_at).toISOString(),
    isRead: Boolean(row.is_read),
    status: String(row.status ?? 'new'),
    messageCount: Number(row.message_count),
    hasUnread: Boolean(row.has_unread),
    hasAttachments: Boolean(row.thread_has_attachments),
    aiAnalysis: row.ai_analysis ?? null,
  }));
}
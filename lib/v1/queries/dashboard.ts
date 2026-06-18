// lib/v1/queries/dashboard.ts

import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { RawDashboardEmail } from '../dashboard';

export async function getDashboardEmails(): Promise<RawDashboardEmail[]> {
  const result = await db.execute(sql`
    SELECT DISTINCT ON (thread_id)
      id,
      thread_id,
      subject,
      from_email,
      from_name,
      snippet,
      received_at,
      is_read,
      action_taken,
      ai_analysis
    FROM emails
    WHERE is_archived = false
      AND is_sent = false
    ORDER BY thread_id, received_at DESC
  `);

  return (result.rows as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    threadId: String(row.thread_id),
    subject: (row.subject as string) ?? null,
    fromEmail: String(row.from_email),
    fromName: (row.from_name as string) ?? null,
    snippet: (row.snippet as string) ?? null,
    receivedAt: new Date(row.received_at as string).toISOString(),
    isRead: Boolean(row.is_read),
    actionTaken: Boolean(row.action_taken),
    aiAnalysis: (row.ai_analysis as Record<string, unknown>) ?? null,
  }));
}

import { and, asc, eq } from 'drizzle-orm';

import { db } from '@/db';
import { emails } from '@/db/schema';

export type ThreadMessage = {
  id: string;
  threadId: string;
  fromEmail: string;
  fromName: string | null;
  toEmails: string[];
  subject: string | null;
  snippet: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  receivedAt: string;
  isRead: boolean;
};

export async function getThreadMessages(
  threadId: string,
  tenantId = 'default',
): Promise<ThreadMessage[]> {
  const rows = await db
    .select({
      id: emails.id,
      threadId: emails.threadId,
      fromEmail: emails.fromEmail,
      fromName: emails.fromName,
      toEmails: emails.toEmails,
      subject: emails.subject,
      snippet: emails.snippet,
      bodyText: emails.bodyText,
      bodyHtml: emails.bodyHtml,
      receivedAt: emails.receivedAt,
      isRead: emails.isRead,
    })
    .from(emails)
    .where(and(eq(emails.tenantId, tenantId), eq(emails.threadId, threadId)))
    .orderBy(asc(emails.receivedAt));

  return rows.map((row) => ({
    ...row,
    isRead: row.isRead ?? false,
    receivedAt: row.receivedAt.toISOString(),
  }));
}
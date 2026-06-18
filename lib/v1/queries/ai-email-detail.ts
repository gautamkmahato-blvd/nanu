// lib/v1/queries/ai-email-detail.ts

import { sql } from 'drizzle-orm';
import { db } from '@/db';

export type EmailDetailRow = {
  id: string;
  threadId: string;
  subject: string | null;
  fromEmail: string;
  fromName: string | null;
  toEmails: string[];
  ccEmails: string[];
  snippet: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  receivedAt: string;
  isRead: boolean;
  isSent: boolean;
  hasAttachments: boolean;
  aiAnalysis: Record<string, unknown> | null;
  status: string;
};

export async function getEmailById(emailId: string, tenantId = 'default'): Promise<EmailDetailRow | null> {
  const result = await db.execute(sql`
    SELECT
      id, thread_id, subject, from_email, from_name,
      to_emails, cc_emails, snippet, body_text, body_html,
      received_at, is_read, is_sent, has_attachments, ai_analysis,
      COALESCE(status, 'new') AS status
    FROM emails
    WHERE tenant_id = ${tenantId}
      AND id = ${emailId}
    LIMIT 1
  `);

  const row = result.rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;

  return {
    id: String(row.id),
    threadId: String(row.thread_id),
    subject: (row.subject as string) ?? null,
    fromEmail: String(row.from_email),
    fromName: (row.from_name as string) ?? null,
    toEmails: Array.isArray(row.to_emails) ? row.to_emails : [],
    ccEmails: Array.isArray(row.cc_emails) ? row.cc_emails : [],
    snippet: (row.snippet as string) ?? null,
    bodyText: (row.body_text as string) ?? null,
    bodyHtml: (row.body_html as string) ?? null,
    receivedAt: new Date(row.received_at as string).toISOString(),
    isRead: Boolean(row.is_read),
    isSent: Boolean(row.is_sent),
    hasAttachments: Boolean(row.has_attachments),
    aiAnalysis: (row.ai_analysis as Record<string, unknown>) ?? null,
    status: String(row.status ?? 'new'),
  };
}

export async function getThreadEmails(threadId: string, tenantId = 'default'): Promise<EmailDetailRow[]> {
  const result = await db.execute(sql`
    SELECT
      id, thread_id, subject, from_email, from_name,
      to_emails, cc_emails, snippet, body_text, body_html,
      received_at, is_read, is_sent, has_attachments, ai_analysis,
      COALESCE(status, 'new') AS status
    FROM emails
    WHERE tenant_id = ${tenantId}
      AND thread_id = ${threadId}
    ORDER BY received_at ASC
  `);

  return (result.rows as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    threadId: String(row.thread_id),
    subject: (row.subject as string) ?? null,
    fromEmail: String(row.from_email),
    fromName: (row.from_name as string) ?? null,
    toEmails: Array.isArray(row.to_emails) ? row.to_emails : [],
    ccEmails: Array.isArray(row.cc_emails) ? row.cc_emails : [],
    snippet: (row.snippet as string) ?? null,
    bodyText: (row.body_text as string) ?? null,
    bodyHtml: (row.body_html as string) ?? null,
    receivedAt: new Date(row.received_at as string).toISOString(),
    isRead: Boolean(row.is_read),
    isSent: Boolean(row.is_sent),
    hasAttachments: Boolean(row.has_attachments),
    aiAnalysis: (row.ai_analysis as Record<string, unknown>) ?? null,
    status: String(row.status ?? 'new'),
  }));
}
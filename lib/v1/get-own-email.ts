// lib/v1/get-own-email.ts

import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { emails } from '@/db/schema';

export async function getOwnEmail(tenantId = 'default'): Promise<string> {
  // Try 1: look up from sent emails in DB
  const [row] = await db
    .select({ fromEmail: emails.fromEmail })
    .from(emails)
    .where(and(eq(emails.tenantId, tenantId), eq(emails.isSent, true)))
    .limit(1);

  if (row?.fromEmail) return row.fromEmail.toLowerCase();

  // Try 2: fall back to session email (available in server context)
  try {
    const { getSession } = await import('@/lib/auth/session');
    const session = await getSession();
    if (session?.email) return session.email.toLowerCase();
  } catch {
    // Not in a request context (e.g. background worker) — skip
  }

  return '';
}
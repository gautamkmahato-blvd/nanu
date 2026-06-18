// lib/v1/get-own-email.ts
// Returns the authenticated user's email address by looking up their sent emails.
// FIXED: removed OWN_GMAIL_ADDRESS env fallback — it returned the same address
// for every tenant, breaking multi-tenant identity.

import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { emails } from '@/db/schema';

export async function getOwnEmail(tenantId = 'default'): Promise<string> {
  const [row] = await db
    .select({ fromEmail: emails.fromEmail })
    .from(emails)
    .where(and(eq(emails.tenantId, tenantId), eq(emails.isSent, true)))
    .limit(1);

  return row?.fromEmail?.toLowerCase() ?? '';
}
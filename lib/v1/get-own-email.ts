import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { emails } from '@/db/schema';

export async function getOwnEmail(): Promise<string> {
  const fromEnv = process.env.OWN_GMAIL_ADDRESS?.trim().toLowerCase();

  if (fromEnv) {
    return fromEnv;
  }

  const [row] = await db
    .select({ fromEmail: emails.fromEmail })
    .from(emails)
    .where(eq(emails.isSent, true))
    .limit(1);

  return row?.fromEmail?.toLowerCase() ?? '';
}

import { sql } from 'drizzle-orm';

import { db } from '@/db';
import { contacts, emails } from '@/db/schema';
import { emailRowSchema, type EmailRow } from '@/lib/schemas/v1/parsed-email';
import { parseGmailMessage, type GmailMessage } from '@/lib/v1/parser';

export async function upsertEmail(row: EmailRow): Promise<void> {
  await db
    .insert(emails)
    .values(row)
    .onConflictDoUpdate({
      target: emails.id,
      set: {
        labelIds: row.labelIds,
        isRead: row.isRead,
        isStarred: row.isStarred,
        isArchived: row.isArchived,
        historyId: row.historyId,
        updatedAt: new Date(),
      },
    });
}

async function upsertContactsFromEmail(
  row: EmailRow,
  ownEmail: string,
): Promise<void> {
  if (!ownEmail) {
    return;
  }

  const counterparts: { email: string; name: string | null }[] = row.isSent
    ? row.toEmails
        .filter((email) => email.toLowerCase() !== ownEmail)
        .map((email) => ({ email: email.toLowerCase(), name: null }))
    : row.fromEmail.toLowerCase() !== ownEmail
      ? [{ email: row.fromEmail.toLowerCase(), name: row.fromName }]
      : [];

  for (const counterpart of counterparts) {
    await db
      .insert(contacts)
      .values({
        email: counterpart.email,
        name: counterpart.name,
        interactionCount: 1,
        lastInteractionAt: row.receivedAt,
      })
      .onConflictDoUpdate({
        target: contacts.email,
        set: {
          name: sql`COALESCE(${contacts.name}, ${counterpart.name})`,
          interactionCount: sql`${contacts.interactionCount} + 1`,
          lastInteractionAt: sql`GREATEST(COALESCE(${contacts.lastInteractionAt}, 'epoch'::timestamptz), ${row.receivedAt.toISOString()}::timestamptz)`,
          updatedAt: new Date(),
        },
      });
  }
}

export async function ingestMessage(
  msg: GmailMessage,
  ownEmail: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const parsed = parseGmailMessage(msg);
  const result = emailRowSchema.safeParse(parsed);

  if (!result.success) {
    const error = JSON.stringify(result.error.flatten().fieldErrors);
    console.error(`[v1 ingest] skipping message ${msg.id}: ${error}`);
    return { ok: false, id: msg.id, error };
  }

  await upsertEmail(result.data);

  if (ownEmail) {
    await upsertContactsFromEmail(result.data, ownEmail);
  }

  return { ok: true, id: result.data.id };
}

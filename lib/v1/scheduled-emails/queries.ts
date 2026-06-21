// lib/v1/scheduled-emails/queries.ts

import { db } from '@/db';
import { sql } from 'drizzle-orm';
import type { ScheduledEmail, ScheduledEmailStatus } from './types';
import { STALE_PROCESSING_MINUTES } from './types';

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createScheduledEmail(
  tenantId: string,
  input: {
    type: string;
    threadId?: string | null;
    toEmails: string[];
    ccEmails: string[];
    subject: string;
    body: string;
    isReply: boolean;
    scheduledAt: string;
    watchEmail?: string | null;
    followUpHours?: number | null;
  },
): Promise<string> {
  const result = await db.execute(sql`
    INSERT INTO scheduled_emails (
      tenant_id, type, thread_id, to_emails, cc_emails,
      subject, body, is_reply, scheduled_at,
      watch_email, follow_up_hours
    ) VALUES (
      ${tenantId},
      ${input.type},
      ${input.threadId ?? null},
      ${sql`ARRAY[${sql.join(input.toEmails.map((e) => sql`${e}`), sql`,`)}]::text[]`},
      ${sql`ARRAY[${sql.join((input.ccEmails ?? []).map((e) => sql`${e}`), sql`,`)}]::text[]`},
      ${input.subject},
      ${input.body},
      ${input.isReply},
      ${input.scheduledAt}::timestamptz,
      ${input.watchEmail ?? null},
      ${input.followUpHours ?? null}
    )
    RETURNING id
  `);

  return String(result.rows[0].id);
}

// ---------------------------------------------------------------------------
// List for a tenant
// ---------------------------------------------------------------------------

export async function listScheduledEmails(
  tenantId: string,
  status?: ScheduledEmailStatus,
  limit = 50,
): Promise<ScheduledEmail[]> {
  const statusFilter = status ? sql`AND status = ${status}` : sql``;

  const result = await db.execute(sql`
    SELECT * FROM scheduled_emails
    WHERE tenant_id = ${tenantId} ${statusFilter}
    ORDER BY scheduled_at ASC
    LIMIT ${limit}
  `);

  return result.rows.map(mapRow);
}

// ---------------------------------------------------------------------------
// Get single
// ---------------------------------------------------------------------------

export async function getScheduledEmail(
  tenantId: string,
  id: string,
): Promise<ScheduledEmail | null> {
  const result = await db.execute(sql`
    SELECT * FROM scheduled_emails
    WHERE tenant_id = ${tenantId} AND id = ${id}
    LIMIT 1
  `);

  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

// ---------------------------------------------------------------------------
// Update (only pending emails can be edited)
// ---------------------------------------------------------------------------

export async function updateScheduledEmail(
  tenantId: string,
  id: string,
  updates: {
    subject?: string;
    body?: string;
    scheduledAt?: string;
    toEmails?: string[];
    ccEmails?: string[];
  },
): Promise<boolean> {
  const sets: ReturnType<typeof sql>[] = [];

  if (updates.subject !== undefined) sets.push(sql`subject = ${updates.subject}`);
  if (updates.body !== undefined) sets.push(sql`body = ${updates.body}`);
  if (updates.scheduledAt !== undefined) sets.push(sql`scheduled_at = ${updates.scheduledAt}::timestamptz`);
  if (updates.toEmails !== undefined) {
    sets.push(sql`to_emails = ARRAY[${sql.join(updates.toEmails.map((e) => sql`${e}`), sql`,`)}]::text[]`);
  }
  if (updates.ccEmails !== undefined) {
    sets.push(sql`cc_emails = ARRAY[${sql.join(updates.ccEmails.map((e) => sql`${e}`), sql`,`)}]::text[]`);
  }

  if (sets.length === 0) return false;

  sets.push(sql`updated_at = now()`);

  const result = await db.execute(sql`
    UPDATE scheduled_emails
    SET ${sql.join(sets, sql`, `)}
    WHERE tenant_id = ${tenantId} AND id = ${id} AND status = 'pending'
  `);

  return (result.rowCount ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Cancel
// ---------------------------------------------------------------------------

export async function cancelScheduledEmail(
  tenantId: string,
  id: string,
): Promise<boolean> {
  const result = await db.execute(sql`
    UPDATE scheduled_emails
    SET status = 'cancelled', updated_at = now()
    WHERE tenant_id = ${tenantId} AND id = ${id} AND status = 'pending'
  `);

  return (result.rowCount ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Fetch due emails for processing (atomic claim)
// ---------------------------------------------------------------------------

export async function claimDueEmails(limit = 10): Promise<ScheduledEmail[]> {
  // First: reset stale 'processing' rows (stuck > 5 min)
  await db.execute(sql`
    UPDATE scheduled_emails
    SET status = 'pending', updated_at = now()
    WHERE status = 'processing'
      AND updated_at < now() - interval '${sql.raw(String(STALE_PROCESSING_MINUTES))} minutes'
  `);

  // Atomically claim pending emails that are due
  const result = await db.execute(sql`
    UPDATE scheduled_emails
    SET status = 'processing', updated_at = now()
    WHERE id IN (
      SELECT id FROM scheduled_emails
      WHERE status = 'pending' AND scheduled_at <= now()
      ORDER BY scheduled_at ASC
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *
  `);

  return result.rows.map(mapRow);
}

// ---------------------------------------------------------------------------
// Mark sent / failed
// ---------------------------------------------------------------------------

export async function markSent(id: string): Promise<void> {
  await db.execute(sql`
    UPDATE scheduled_emails
    SET status = 'sent', sent_at = now(), updated_at = now()
    WHERE id = ${id}
  `);
}

export async function markFailed(id: string, error: string, retryCount: number): Promise<void> {
  const maxRetries = 3;
  const newStatus = retryCount >= maxRetries ? 'failed' : 'pending';

  await db.execute(sql`
    UPDATE scheduled_emails
    SET status = ${newStatus},
        error = ${error},
        retry_count = ${retryCount},
        scheduled_at = CASE
          WHEN ${retryCount} < ${maxRetries} THEN now() + interval '2 minutes'
          ELSE scheduled_at
        END,
        updated_at = now()
    WHERE id = ${id}
  `);
}

// ---------------------------------------------------------------------------
// Count pending for a tenant (for sidebar badge)
// ---------------------------------------------------------------------------

export async function countPending(tenantId: string): Promise<number> {
  const result = await db.execute(sql`
    SELECT COUNT(*)::int AS cnt FROM scheduled_emails
    WHERE tenant_id = ${tenantId} AND status = 'pending'
  `);

  return (result.rows[0] as any)?.cnt ?? 0;
}

// ---------------------------------------------------------------------------
// Check if a reply was received (for follow-up type)
// ---------------------------------------------------------------------------

export async function hasReceivedReply(
  tenantId: string,
  watchEmail: string,
  since: string,
): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT 1 FROM emails
    WHERE tenant_id = ${tenantId}
      AND LOWER(from_email) = ${watchEmail.toLowerCase()}
      AND received_at > ${since}::timestamptz
    LIMIT 1
  `);

  return result.rows.length > 0;
}

// ---------------------------------------------------------------------------
// Row mapper
// ---------------------------------------------------------------------------

function mapRow(row: Record<string, unknown>): ScheduledEmail {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    type: String(row.type) as ScheduledEmail['type'],
    threadId: row.thread_id ? String(row.thread_id) : null,
    toEmails: (row.to_emails as string[]) ?? [],
    ccEmails: (row.cc_emails as string[]) ?? [],
    subject: String(row.subject),
    body: String(row.body),
    isReply: Boolean(row.is_reply),
    scheduledAt: new Date(row.scheduled_at as string).toISOString(),
    watchEmail: row.watch_email ? String(row.watch_email) : null,
    followUpHours: row.follow_up_hours ? Number(row.follow_up_hours) : null,
    status: String(row.status) as ScheduledEmail['status'],
    sentAt: row.sent_at ? new Date(row.sent_at as string).toISOString() : null,
    error: row.error ? String(row.error) : null,
    retryCount: Number(row.retry_count ?? 0),
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
  };
}

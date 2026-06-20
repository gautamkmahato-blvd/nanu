// lib/v1/reminders/queries.ts

import { db } from '@/db';
import { sql } from 'drizzle-orm';
import type { ReminderSettings, ReminderLog } from './types';

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function getReminderSettings(tenantId: string): Promise<ReminderSettings | null> {
  const result = await db.execute(sql`
    SELECT * FROM reminder_settings WHERE tenant_id = ${tenantId} LIMIT 1
  `);
  return result.rows[0] ? mapSettings(result.rows[0]) : null;
}

export async function upsertReminderSettings(
  tenantId: string,
  input: {
    phoneNumber?: string | null;
    callEnabled?: boolean;
    telegramEnabled?: boolean;
    reminderMinutes?: number;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    timezone?: string;
  },
): Promise<ReminderSettings> {
  const existing = await getReminderSettings(tenantId);

  if (existing) {
    const result = await db.execute(sql`
      UPDATE reminder_settings SET
        phone_number = ${input.phoneNumber ?? existing.phoneNumber},
        call_enabled = ${input.callEnabled ?? existing.callEnabled},
        telegram_enabled = ${input.telegramEnabled ?? existing.telegramEnabled},
        reminder_minutes = ${input.reminderMinutes ?? existing.reminderMinutes},
        quiet_hours_start = ${input.quietHoursStart ?? existing.quietHoursStart},
        quiet_hours_end = ${input.quietHoursEnd ?? existing.quietHoursEnd},
        timezone = ${input.timezone ?? existing.timezone},
        updated_at = now()
      WHERE tenant_id = ${tenantId}
      RETURNING *
    `);
    return mapSettings(result.rows[0]);
  }

  const result = await db.execute(sql`
    INSERT INTO reminder_settings (
      tenant_id, phone_number, call_enabled, telegram_enabled,
      reminder_minutes, quiet_hours_start, quiet_hours_end, timezone
    ) VALUES (
      ${tenantId}, ${input.phoneNumber ?? null}, ${input.callEnabled ?? false},
      ${input.telegramEnabled ?? false}, ${input.reminderMinutes ?? 5},
      ${input.quietHoursStart ?? '22:00'}, ${input.quietHoursEnd ?? '07:00'},
      ${input.timezone ?? 'UTC'}
    ) RETURNING *
  `);
  return mapSettings(result.rows[0]);
}

/** Get all tenants with call reminders enabled */
export async function getEnabledTenants(): Promise<ReminderSettings[]> {
  const result = await db.execute(sql`
    SELECT * FROM reminder_settings
    WHERE call_enabled = true AND phone_number IS NOT NULL
  `);
  return result.rows.map(mapSettings);
}

// ---------------------------------------------------------------------------
// Logs
// ---------------------------------------------------------------------------

/** Check if a reminder was already sent for this event */
export async function hasReminderBeenSent(tenantId: string, eventId: string, callType: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT 1 FROM reminder_logs
    WHERE tenant_id = ${tenantId} AND event_id = ${eventId} AND call_type = ${callType}
    LIMIT 1
  `);
  return result.rows.length > 0;
}

/** Log a reminder attempt */
export async function logReminder(input: {
  tenantId: string;
  eventId: string;
  eventSummary: string;
  phoneNumber: string | null;
  callType: string;
  status: string;
  vapiCallId?: string;
  error?: string;
}): Promise<void> {
  await db.execute(sql`
    INSERT INTO reminder_logs (
      tenant_id, event_id, event_summary, phone_number, call_type, status, vapi_call_id, error
    ) VALUES (
      ${input.tenantId}, ${input.eventId}, ${input.eventSummary},
      ${input.phoneNumber ?? null}, ${input.callType}, ${input.status},
      ${input.vapiCallId ?? null}, ${input.error ?? null}
    ) ON CONFLICT (tenant_id, event_id, call_type) DO NOTHING
  `);
}

/** Get recent reminder logs for a tenant */
export async function getRecentLogs(tenantId: string, limit = 20): Promise<ReminderLog[]> {
  const result = await db.execute(sql`
    SELECT * FROM reminder_logs
    WHERE tenant_id = ${tenantId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `);
  return result.rows.map(mapLog);
}

// ---------------------------------------------------------------------------
// Rate limiting — max calls per tenant per hour
// ---------------------------------------------------------------------------

export async function countRecentCalls(tenantId: string): Promise<number> {
  const result = await db.execute(sql`
    SELECT COUNT(*)::int as count FROM reminder_logs
    WHERE tenant_id = ${tenantId} AND call_type = 'vapi'
    AND created_at > now() - interval '1 hour'
  `);
  return (result.rows[0] as any)?.count ?? 0;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapSettings(row: Record<string, unknown>): ReminderSettings {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    phoneNumber: row.phone_number ? String(row.phone_number) : null,
    callEnabled: Boolean(row.call_enabled),
    telegramEnabled: Boolean(row.telegram_enabled),
    reminderMinutes: Number(row.reminder_minutes ?? 5),
    quietHoursStart: String(row.quiet_hours_start ?? '22:00'),
    quietHoursEnd: String(row.quiet_hours_end ?? '07:00'),
    timezone: String(row.timezone ?? 'UTC'),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapLog(row: Record<string, unknown>): ReminderLog {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    eventId: String(row.event_id),
    eventSummary: String(row.event_summary ?? ''),
    phoneNumber: row.phone_number ? String(row.phone_number) : null,
    callType: String(row.call_type) as 'vapi' | 'telegram',
    status: String(row.status) as 'triggered' | 'completed' | 'failed',
    vapiCallId: row.vapi_call_id ? String(row.vapi_call_id) : null,
    error: row.error ? String(row.error) : null,
    createdAt: String(row.created_at),
  };
}

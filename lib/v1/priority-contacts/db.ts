// lib/v1/priority-contacts/db.ts
// CRUD operations for priority contacts and notification settings.
// Auto-creates tables on first use.

import { sql } from 'drizzle-orm';
import { db } from '@/db';
import type { PriorityContact, NotificationSettings } from './types';

// ---------------------------------------------------------------------------
// Auto-create tables
// ---------------------------------------------------------------------------

let tablesChecked = false;

async function ensureTables(): Promise<void> {
  if (tablesChecked) return;

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS priority_contacts (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        tenant_id TEXT NOT NULL DEFAULT 'default',
        email TEXT NOT NULL,
        name TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT priority_contacts_tenant_email_unique UNIQUE (tenant_id, email)
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notification_settings (
        tenant_id TEXT NOT NULL DEFAULT 'default',
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (tenant_id, key)
      )
    `);

    tablesChecked = true;
  } catch (err: any) {
    // Table already exists — pg_type conflict is harmless
    if (err?.cause?.code === '23505' || err?.code === '23505') {
      tablesChecked = true;
      return;
    }
    console.warn('[priority-contacts] Could not create tables:', err);
  }
}

// ---------------------------------------------------------------------------
// Priority Contacts CRUD
// ---------------------------------------------------------------------------

export async function listContacts(tenantId = 'default'): Promise<PriorityContact[]> {
  await ensureTables();

  const rows = await db.execute(sql`
    SELECT id, email, name, notes, created_at
    FROM priority_contacts
    WHERE tenant_id = ${tenantId}
    ORDER BY created_at DESC
  `);

  return rows.rows.map((r: any) => ({
    id: String(r.id),
    email: String(r.email),
    name: r.name ?? null,
    notes: r.notes ?? null,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

export async function addContact(
  email: string,
  name?: string | null,
  notes?: string | null,
  tenantId = 'default',
): Promise<PriorityContact> {
  await ensureTables();

  const normalized = email.trim().toLowerCase();

  if (!normalized || !normalized.includes('@')) {
    throw new Error('Invalid email address');
  }

  const rows = await db.execute(sql`
    INSERT INTO priority_contacts (tenant_id, email, name, notes)
    VALUES (${tenantId}, ${normalized}, ${name ?? null}, ${notes ?? null})
    ON CONFLICT (tenant_id, email) DO UPDATE SET
      name = COALESCE(EXCLUDED.name, priority_contacts.name),
      notes = COALESCE(EXCLUDED.notes, priority_contacts.notes)
    RETURNING id, email, name, notes, created_at
  `);

  const r = rows.rows[0] as any;
  return {
    id: String(r.id),
    email: String(r.email),
    name: r.name ?? null,
    notes: r.notes ?? null,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

export async function deleteContact(id: string, tenantId = 'default'): Promise<boolean> {
  await ensureTables();

  const result = await db.execute(sql`
    DELETE FROM priority_contacts
    WHERE tenant_id = ${tenantId}
      AND id = ${id}
  `);

  return (result.rowCount ?? 0) > 0;
}

export async function isContactPriority(email: string, tenantId = 'default'): Promise<PriorityContact | null> {
  await ensureTables();

  const normalized = email.trim().toLowerCase();

  const rows = await db.execute(sql`
    SELECT id, email, name, notes, created_at
    FROM priority_contacts
    WHERE tenant_id = ${tenantId}
      AND email = ${normalized}
    LIMIT 1
  `);

  if (rows.rows.length === 0) return null;

  const r = rows.rows[0] as any;
  return {
    id: String(r.id),
    email: String(r.email),
    name: r.name ?? null,
    notes: r.notes ?? null,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Notification Settings
// ---------------------------------------------------------------------------

export async function getNotificationSettings(tenantId = 'default'): Promise<NotificationSettings> {
  await ensureTables();

  const rows = await db.execute(sql`
    SELECT key, value FROM notification_settings
    WHERE tenant_id = ${tenantId}
      AND key IN ('telegram_bot_token', 'telegram_chat_id', 'telegram_enabled')
  `);

  const settings: Record<string, string> = {};
  for (const r of rows.rows as any[]) {
    settings[r.key] = r.value;
  }

  return {
    telegramBotToken: settings.telegram_bot_token ?? null,
    telegramChatId: settings.telegram_chat_id ?? null,
    telegramEnabled: settings.telegram_enabled === 'true',
  };
}

export async function updateNotificationSettings(
  updates: Partial<NotificationSettings>,
  tenantId = 'default',
): Promise<NotificationSettings> {
  await ensureTables();

  const keyMap: Record<string, string | undefined> = {
    telegram_bot_token: updates.telegramBotToken ?? undefined,
    telegram_chat_id: updates.telegramChatId ?? undefined,
    telegram_enabled: updates.telegramEnabled !== undefined ? String(updates.telegramEnabled) : undefined,
  };

  for (const [key, value] of Object.entries(keyMap)) {
    if (value === undefined) continue;

    await db.execute(sql`
      INSERT INTO notification_settings (tenant_id, key, value, updated_at)
      VALUES (${tenantId}, ${key}, ${value}, NOW())
      ON CONFLICT (tenant_id, key) DO UPDATE SET value = ${value}, updated_at = NOW()
    `);
  }

  return getNotificationSettings(tenantId);
}
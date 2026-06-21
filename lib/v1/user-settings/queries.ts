// lib/v1/user-settings/queries.ts

import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { encrypt, decrypt } from './crypto';
import type { UserSettings, DailyUsage, UsageSource } from './types';

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function getUserSettings(tenantId: string): Promise<UserSettings | null> {
  const result = await db.execute(sql`
    SELECT id, tenant_id, has_api_key, sync_limit, created_at, updated_at
    FROM user_settings WHERE tenant_id = ${tenantId} LIMIT 1
  `);
  return result.rows[0] ? mapSettings(result.rows[0]) : null;
}

/** Check if tenant has their own API key (fast, no decryption) */
export async function hasByokKey(tenantId: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT has_api_key FROM user_settings
    WHERE tenant_id = ${tenantId} AND has_api_key = true LIMIT 1
  `);
  return result.rows.length > 0;
}

/** Get the decrypted API key for a tenant (returns null if not set) */
export async function getDecryptedApiKey(tenantId: string): Promise<string | null> {
  const result = await db.execute(sql`
    SELECT encrypted_api_key, api_key_iv, api_key_tag
    FROM user_settings
    WHERE tenant_id = ${tenantId} AND has_api_key = true LIMIT 1
  `);

  const row = result.rows[0] as Record<string, unknown> | undefined;
  if (!row?.encrypted_api_key || !row?.api_key_iv || !row?.api_key_tag) return null;

  try {
    return decrypt(
      String(row.encrypted_api_key),
      String(row.api_key_iv),
      String(row.api_key_tag),
    );
  } catch (err) {
    console.error('[user-settings] failed to decrypt API key:', err);
    return null;
  }
}

/** Save an encrypted API key */
export async function saveApiKey(tenantId: string, plainApiKey: string): Promise<void> {
  const { ciphertext, iv, tag } = encrypt(plainApiKey);

  const existing = await getUserSettings(tenantId);
  if (existing) {
    await db.execute(sql`
      UPDATE user_settings SET
        encrypted_api_key = ${ciphertext},
        api_key_iv = ${iv},
        api_key_tag = ${tag},
        has_api_key = true,
        updated_at = now()
      WHERE tenant_id = ${tenantId}
    `);
  } else {
    await db.execute(sql`
      INSERT INTO user_settings (tenant_id, encrypted_api_key, api_key_iv, api_key_tag, has_api_key)
      VALUES (${tenantId}, ${ciphertext}, ${iv}, ${tag}, true)
    `);
  }
}

/** Remove API key (revert to platform key) */
export async function removeApiKey(tenantId: string): Promise<void> {
  await db.execute(sql`
    UPDATE user_settings SET
      encrypted_api_key = NULL, api_key_iv = NULL, api_key_tag = NULL,
      has_api_key = false, sync_limit = 20, updated_at = now()
    WHERE tenant_id = ${tenantId}
  `);
}

/** Update sync limit (only for BYOK users) */
export async function updateSyncLimit(tenantId: string, limit: number): Promise<void> {
  const existing = await getUserSettings(tenantId);
  if (existing) {
    await db.execute(sql`
      UPDATE user_settings SET sync_limit = ${limit}, updated_at = now()
      WHERE tenant_id = ${tenantId}
    `);
  } else {
    await db.execute(sql`
      INSERT INTO user_settings (tenant_id, sync_limit)
      VALUES (${tenantId}, ${limit})
    `);
  }
}

// ---------------------------------------------------------------------------
// Usage tracking
// ---------------------------------------------------------------------------

/** Increment daily usage counter. Returns new count. */
/** Increment daily usage. isByok = true tracks separately, doesn't touch chat_count. */
export async function incrementUsage(tenantId: string, source: UsageSource, isByok: boolean = false): Promise<number> {
  const sourceCol = source === 'agent' ? 'agent_count' : source === 'search' ? 'search_count' : 'assistant_count';

  if (isByok) {
    // BYOK: only increment byok_chat_count + source column, NOT chat_count
    await db.execute(sql.raw(`
      INSERT INTO ai_usage_daily (tenant_id, usage_date, chat_count, byok_chat_count, ${sourceCol})
      VALUES ('${tenantId}', CURRENT_DATE, 0, 1, 1)
      ON CONFLICT (tenant_id, usage_date)
      DO UPDATE SET
        byok_chat_count = ai_usage_daily.byok_chat_count + 1,
        ${sourceCol} = ai_usage_daily.${sourceCol} + 1
      RETURNING chat_count
    `));
    return 0; // doesn't matter for BYOK, they're unlimited
  }

  // Free tier: increment chat_count + source column
  const result = await db.execute(sql.raw(`
    INSERT INTO ai_usage_daily (tenant_id, usage_date, chat_count, ${sourceCol})
    VALUES ('${tenantId}', CURRENT_DATE, 1, 1)
    ON CONFLICT (tenant_id, usage_date)
    DO UPDATE SET
      chat_count = ai_usage_daily.chat_count + 1,
      ${sourceCol} = ai_usage_daily.${sourceCol} + 1
    RETURNING chat_count
  `));

  return (result.rows[0] as any)?.chat_count ?? 1;
}

/** Get today's usage for a tenant */
export async function getDailyUsage(tenantId: string): Promise<DailyUsage> {
  const result = await db.execute(sql`
    SELECT chat_count, agent_count, search_count, assistant_count, usage_date
    FROM ai_usage_daily
    WHERE tenant_id = ${tenantId} AND usage_date = CURRENT_DATE
    LIMIT 1
  `);

  const row = result.rows[0] as Record<string, unknown> | undefined;
  if (!row) return { chatCount: 0, agentCount: 0, searchCount: 0, assistantCount: 0, date: new Date().toISOString().split('T')[0] };

  return {
    chatCount: Number(row.chat_count ?? 0),
    agentCount: Number(row.agent_count ?? 0),
    searchCount: Number(row.search_count ?? 0),
    assistantCount: Number(row.assistant_count ?? 0),
    date: String(row.usage_date),
  };
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

function mapSettings(row: Record<string, unknown>): UserSettings {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    hasApiKey: Boolean(row.has_api_key),
    syncLimit: Number(row.sync_limit ?? 20),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

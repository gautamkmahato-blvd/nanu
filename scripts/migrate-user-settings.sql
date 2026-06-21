-- scripts/migrate-user-settings.sql
-- Run: psql $DATABASE_URL < scripts/migrate-user-settings.sql
-- Creates: user_settings, ai_usage_daily

-- ============================================================
-- 1. User Settings — API key (encrypted) + preferences
-- ============================================================

CREATE TABLE IF NOT EXISTS user_settings (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id         TEXT NOT NULL UNIQUE,
  -- Encrypted OpenRouter API key (AES-256-GCM)
  encrypted_api_key TEXT,              -- base64 ciphertext
  api_key_iv        TEXT,              -- base64 IV
  api_key_tag       TEXT,              -- base64 auth tag
  has_api_key       BOOLEAN NOT NULL DEFAULT false,
  -- Sync preferences
  sync_limit        INT NOT NULL DEFAULT 20,  -- default 20, BYOK users can set up to 500
  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. AI Usage Daily — tracks daily chat usage per tenant
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_usage_daily (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id   TEXT NOT NULL,
  usage_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  chat_count  INT NOT NULL DEFAULT 0,
  -- Track by source for analytics
  agent_count INT NOT NULL DEFAULT 0,    -- /api/v1/ai-agent
  search_count INT NOT NULL DEFAULT 0,   -- /api/v1/ai-chat
  assistant_count INT NOT NULL DEFAULT 0, -- /api/v1/email-assistant
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per tenant per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_usage_daily_tenant_date
  ON ai_usage_daily (tenant_id, usage_date);

CREATE INDEX IF NOT EXISTS idx_ai_usage_daily_date
  ON ai_usage_daily (usage_date);

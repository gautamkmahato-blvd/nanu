-- scripts/migrate-multi-tenant.sql
-- Adds tenant_id to all application tables for multi-tenant isolation.
--
-- SAFE TO RUN MULTIPLE TIMES — every statement is idempotent.
-- Existing data gets tenant_id = 'default' (your current single-tenant data).
--
-- Run with: node scripts/run-multi-tenant.mjs
--   or:     psql $POSTGRES_DATABASE_URL -f scripts/migrate-multi-tenant.sql

BEGIN;

-- ============================================================
-- 1. emails — add tenant_id + composite indexes
-- ============================================================
ALTER TABLE emails
  ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'default';

CREATE INDEX IF NOT EXISTS emails_tenant_idx
  ON emails(tenant_id);

CREATE INDEX IF NOT EXISTS emails_tenant_received_idx
  ON emails(tenant_id, received_at DESC);

CREATE INDEX IF NOT EXISTS emails_tenant_thread_idx
  ON emails(tenant_id, thread_id);


-- ============================================================
-- 2. contacts — add tenant_id, change PK to (tenant_id, email)
-- ============================================================
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'default';

-- Swap PK from (email) → (tenant_id, email) if not already composite
DO $$
DECLARE
  col_count INT;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.key_column_usage
  WHERE table_name = 'contacts'
    AND constraint_name = 'contacts_pkey';

  -- If PK has only 1 column, it's the old (email-only) PK → swap it
  IF col_count = 1 THEN
    ALTER TABLE contacts DROP CONSTRAINT contacts_pkey;
    ALTER TABLE contacts ADD PRIMARY KEY (tenant_id, email);
  END IF;
END $$;

DROP INDEX IF EXISTS contacts_score_idx;
CREATE INDEX IF NOT EXISTS contacts_tenant_score_idx
  ON contacts(tenant_id, relationship_score DESC);


-- ============================================================
-- 3. ai_conversations — create if missing, add tenant_id
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL DEFAULT 'New Chat',
  message_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ai_conversations
  ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'default';

CREATE INDEX IF NOT EXISTS ai_conversations_tenant_updated_idx
  ON ai_conversations(tenant_id, updated_at DESC);


-- ============================================================
-- 4. ai_chat_messages — create if missing, add tenant_id
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL DEFAULT '',
  emails JSONB,
  tools_used TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ai_chat_messages
  ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'default';

CREATE INDEX IF NOT EXISTS ai_chat_messages_tenant_conv_idx
  ON ai_chat_messages(tenant_id, conversation_id, created_at);


-- ============================================================
-- 5. priority_contacts — create if missing, add tenant_id
-- ============================================================
CREATE TABLE IF NOT EXISTS priority_contacts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL,
  name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE priority_contacts
  ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'default';

-- Swap UNIQUE from (email) → (tenant_id, email) if old constraint exists
DO $$
BEGIN
  ALTER TABLE priority_contacts
    DROP CONSTRAINT priority_contacts_email_key;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE priority_contacts
    ADD CONSTRAINT priority_contacts_tenant_email_unique
    UNIQUE (tenant_id, email);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- 6. notification_settings — create if missing, add tenant_id
-- ============================================================
-- Create with correct composite PK if table doesn't exist
DO $$
BEGIN
  -- Only runs if table doesn't exist
  CREATE TABLE notification_settings (
    tenant_id TEXT NOT NULL DEFAULT 'default',
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (tenant_id, key)
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- If table existed, add the column
ALTER TABLE notification_settings
  ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'default';

-- Swap PK from (key) → (tenant_id, key) if not already composite
DO $$
DECLARE
  col_count INT;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.key_column_usage
  WHERE table_name = 'notification_settings'
    AND constraint_name = 'notification_settings_pkey';

  IF col_count = 1 THEN
    ALTER TABLE notification_settings DROP CONSTRAINT notification_settings_pkey;
    ALTER TABLE notification_settings ADD PRIMARY KEY (tenant_id, key);
  END IF;
END $$;


-- ============================================================
-- 7. meeting_prep_cache — create if missing, add tenant_id
-- ============================================================
-- Create with correct schema if table doesn't exist
DO $$
BEGIN
  CREATE TABLE meeting_prep_cache (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tenant_id TEXT NOT NULL DEFAULT 'default',
    event_id TEXT NOT NULL,
    event_summary TEXT,
    event_start TEXT,
    prep_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT meeting_prep_cache_tenant_event_unique UNIQUE (tenant_id, event_id)
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- If table existed, add tenant_id
ALTER TABLE meeting_prep_cache
  ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'default';

-- Swap unique from (event_id) → (tenant_id, event_id)
DO $$
BEGIN
  -- Drop old event_id-only unique (could be a PK or unique constraint)
  ALTER TABLE meeting_prep_cache
    DROP CONSTRAINT IF EXISTS meeting_prep_cache_event_id_key;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE meeting_prep_cache
    ADD CONSTRAINT meeting_prep_cache_tenant_event_unique
    UNIQUE (tenant_id, event_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS meeting_prep_cache_tenant_event_idx
  ON meeting_prep_cache(tenant_id, event_id);


COMMIT;

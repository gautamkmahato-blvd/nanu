-- scripts/migrate-reminders.sql
-- Run: psql $DATABASE_URL < scripts/migrate-reminders.sql
-- Creates: reminder_settings, reminder_logs

-- ============================================================
-- 1. Reminder Settings — per-tenant config
-- ============================================================

CREATE TABLE IF NOT EXISTS reminder_settings (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id     TEXT NOT NULL UNIQUE,
  phone_number  TEXT,                          -- E.164: +91XXXXXXXXXX
  call_enabled  BOOLEAN NOT NULL DEFAULT false,
  telegram_enabled BOOLEAN NOT NULL DEFAULT false,
  reminder_minutes INT NOT NULL DEFAULT 5,     -- minutes before meeting
  quiet_hours_start TEXT DEFAULT '22:00',       -- don't call after this
  quiet_hours_end   TEXT DEFAULT '07:00',       -- don't call before this
  timezone      TEXT NOT NULL DEFAULT 'UTC',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. Reminder Logs — track sent reminders (prevent duplicates)
-- ============================================================

CREATE TABLE IF NOT EXISTS reminder_logs (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id     TEXT NOT NULL,
  event_id      TEXT NOT NULL,                 -- Google Calendar event ID
  event_summary TEXT NOT NULL DEFAULT '',
  phone_number  TEXT,
  call_type     TEXT NOT NULL DEFAULT 'vapi',  -- vapi | telegram
  status        TEXT NOT NULL DEFAULT 'triggered', -- triggered | completed | failed
  vapi_call_id  TEXT,
  error         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent duplicate calls for the same meeting
CREATE UNIQUE INDEX IF NOT EXISTS idx_reminder_logs_unique
  ON reminder_logs (tenant_id, event_id, call_type);

CREATE INDEX IF NOT EXISTS idx_reminder_logs_tenant
  ON reminder_logs (tenant_id, created_at);

-- scripts/migrate-scheduled-emails.sql
-- Run: psql $DATABASE_URL < scripts/migrate-scheduled-emails.sql

CREATE TABLE IF NOT EXISTS scheduled_emails (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       TEXT NOT NULL,

  -- Type: 'scheduled_send' = timed send, 'follow_up' = auto follow-up if no reply
  type            TEXT NOT NULL DEFAULT 'scheduled_send'
                  CHECK (type IN ('scheduled_send', 'follow_up')),

  -- Email content
  thread_id       TEXT,                     -- NULL = new email, set = reply to thread
  to_emails       TEXT[] NOT NULL,
  cc_emails       TEXT[] DEFAULT '{}',
  subject         TEXT NOT NULL,
  body            TEXT NOT NULL,
  is_reply        BOOLEAN NOT NULL DEFAULT false,

  -- Schedule
  scheduled_at    TIMESTAMPTZ NOT NULL,

  -- Follow-up specific
  watch_email     TEXT,                     -- watch for reply from this address
  follow_up_hours INT,                      -- hours to wait before sending follow-up

  -- Status lifecycle: pending → processing → sent/failed/cancelled
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processing', 'sent', 'cancelled', 'failed')),
  sent_at         TIMESTAMPTZ,
  error           TEXT,
  retry_count     INT NOT NULL DEFAULT 0,

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cron query: find pending emails due for sending
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_pending
  ON scheduled_emails (status, scheduled_at)
  WHERE status = 'pending';

-- Tenant listing
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_tenant
  ON scheduled_emails (tenant_id, status, scheduled_at DESC);

-- Stale processing check (stuck > 5 min)
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_processing
  ON scheduled_emails (status, updated_at)
  WHERE status = 'processing';

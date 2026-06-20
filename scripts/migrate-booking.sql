-- scripts/migrate-booking.sql
-- Run: psql $DATABASE_URL < scripts/migrate-booking.sql
-- Creates: booking_profiles, bookings, booking_otps

-- ============================================================
-- 1. Booking Profiles — one per tenant, stores public config
-- ============================================================

CREATE TABLE IF NOT EXISTS booking_profiles (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id     TEXT NOT NULL,
  slug          TEXT NOT NULL,
  display_name  TEXT NOT NULL DEFAULT '',
  bio           TEXT NOT NULL DEFAULT '',
  timezone      TEXT NOT NULL DEFAULT 'UTC',
  available_days JSONB NOT NULL DEFAULT '[1,2,3,4,5]',  -- Mon-Fri (0=Sun, 6=Sat)
  hours_start   TEXT NOT NULL DEFAULT '09:00',
  hours_end     TEXT NOT NULL DEFAULT '17:00',
  duration_options JSONB NOT NULL DEFAULT '[15,30,60]',  -- minutes
  default_duration INT NOT NULL DEFAULT 30,
  buffer_minutes INT NOT NULL DEFAULT 10,
  max_advance_days INT NOT NULL DEFAULT 30,
  max_bookings_per_day INT NOT NULL DEFAULT 10,
  meeting_title_template TEXT NOT NULL DEFAULT '{{guest_name}} + {{host_name}}',
  include_meet  BOOLEAN NOT NULL DEFAULT true,
  is_active     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_profiles_slug ON booking_profiles (slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_profiles_tenant ON booking_profiles (tenant_id);

-- ============================================================
-- 2. Bookings — log of every booking made
-- ============================================================

CREATE TABLE IF NOT EXISTS bookings (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       TEXT NOT NULL,
  profile_id      TEXT NOT NULL REFERENCES booking_profiles(id) ON DELETE CASCADE,
  guest_name      TEXT NOT NULL,
  guest_email     TEXT NOT NULL,
  notes           TEXT NOT NULL DEFAULT '',
  date            DATE NOT NULL,
  start_time      TEXT NOT NULL,     -- "10:00" in host timezone
  end_time        TEXT NOT NULL,     -- "10:30" in host timezone
  duration_minutes INT NOT NULL,
  timezone        TEXT NOT NULL,     -- host timezone at time of booking
  google_event_id TEXT,
  meet_link       TEXT,
  status          TEXT NOT NULL DEFAULT 'confirmed',  -- confirmed | cancelled
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON bookings (tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_profile ON bookings (profile_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings (profile_id, date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings (guest_email);

-- ============================================================
-- 3. Booking OTPs — email verification for visitors
-- ============================================================

CREATE TABLE IF NOT EXISTS booking_otps (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email       TEXT NOT NULL,
  slug        TEXT NOT NULL,
  code        TEXT NOT NULL,           -- 6-digit code
  expires_at  TIMESTAMPTZ NOT NULL,
  attempts    INT NOT NULL DEFAULT 0,  -- max 3
  verified    BOOLEAN NOT NULL DEFAULT false,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_otps_email ON booking_otps (email, slug, created_at);
CREATE INDEX IF NOT EXISTS idx_booking_otps_ip ON booking_otps (ip_address, created_at);

-- Cleanup: auto-delete expired OTPs (run periodically or let app handle)
-- DELETE FROM booking_otps WHERE expires_at < now() - interval '1 hour';

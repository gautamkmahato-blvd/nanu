// lib/v1/booking/queries.ts
// All database operations for the booking feature.
// Every query is tenant-scoped where applicable.

import { db } from '@/db';
import { sql } from 'drizzle-orm';
import type { BookingProfile, PublicProfile, Booking, BookingOtp } from './types';
import { ProfileUpdateInput } from './validation';

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

/** Get profile by tenant (host's own profile) */
export async function getProfileByTenant(tenantId: string): Promise<BookingProfile | null> {
  const result = await db.execute(sql`
    SELECT * FROM booking_profiles WHERE tenant_id = ${tenantId} LIMIT 1
  `);
  return result.rows[0] ? mapProfile(result.rows[0]) : null;
}

/** Get public profile by slug (no tenant needed — public) */
export async function getProfileBySlug(slug: string): Promise<BookingProfile | null> {
  const result = await db.execute(sql`
    SELECT * FROM booking_profiles WHERE slug = ${slug} AND is_active = true LIMIT 1
  `);
  return result.rows[0] ? mapProfile(result.rows[0]) : null;
}

/** Get profile by slug (including inactive — for host's own settings) */
export async function getProfileBySlugAny(slug: string): Promise<BookingProfile | null> {
  const result = await db.execute(sql`
    SELECT * FROM booking_profiles WHERE slug = ${slug} LIMIT 1
  `);
  return result.rows[0] ? mapProfile(result.rows[0]) : null;
}

/** Create or update profile */
export async function upsertProfile(tenantId: string, input: ProfileUpdateInput): Promise<BookingProfile> {
  const existing = await getProfileByTenant(tenantId);

  if (existing) {
    // Build update using sql tagged template
    const result = await db.execute(sql`
      UPDATE booking_profiles SET
        slug = ${input.slug ?? existing.slug},
        display_name = ${input.displayName ?? existing.displayName},
        bio = ${input.bio ?? existing.bio},
        timezone = ${input.timezone ?? existing.timezone},
        available_days = ${JSON.stringify(input.availableDays ?? existing.availableDays)},
        hours_start = ${input.hoursStart ?? existing.hoursStart},
        hours_end = ${input.hoursEnd ?? existing.hoursEnd},
        duration_options = ${JSON.stringify(input.durationOptions ?? existing.durationOptions)},
        default_duration = ${input.defaultDuration ?? existing.defaultDuration},
        buffer_minutes = ${input.bufferMinutes ?? existing.bufferMinutes},
        max_advance_days = ${input.maxAdvanceDays ?? existing.maxAdvanceDays},
        max_bookings_per_day = ${input.maxBookingsPerDay ?? existing.maxBookingsPerDay},
        meeting_title_template = ${input.meetingTitleTemplate ?? existing.meetingTitleTemplate},
        include_meet = ${input.includeMeet ?? existing.includeMeet},
        is_active = ${input.isActive ?? existing.isActive},
        updated_at = now()
      WHERE tenant_id = ${tenantId}
      RETURNING *
    `);
    return mapProfile(result.rows[0]);
  } else {
    // Insert
    const slug = input.slug || tenantId.slice(0, 8);
    const result = await db.execute(sql`
      INSERT INTO booking_profiles (
        tenant_id, slug, display_name, bio, timezone,
        available_days, hours_start, hours_end, duration_options, default_duration,
        buffer_minutes, max_advance_days, max_bookings_per_day, meeting_title_template,
        include_meet, is_active
      ) VALUES (
        ${tenantId}, ${slug}, ${input.displayName ?? ''}, ${input.bio ?? ''},
        ${input.timezone ?? 'UTC'}, ${JSON.stringify(input.availableDays ?? [1,2,3,4,5])},
        ${input.hoursStart ?? '09:00'}, ${input.hoursEnd ?? '17:00'},
        ${JSON.stringify(input.durationOptions ?? [15,30,60])}, ${input.defaultDuration ?? 30},
        ${input.bufferMinutes ?? 10}, ${input.maxAdvanceDays ?? 30},
        ${input.maxBookingsPerDay ?? 10}, ${input.meetingTitleTemplate ?? '{{guest_name}} + {{host_name}}'},
        ${input.includeMeet ?? true}, ${input.isActive ?? false}
      ) RETURNING *
    `);
    return mapProfile(result.rows[0]);
  }
}

/** Check if slug is available */
export async function isSlugAvailable(slug: string, excludeTenantId?: string): Promise<boolean> {
  const result = excludeTenantId
    ? await db.execute(sql`SELECT 1 FROM booking_profiles WHERE slug = ${slug} AND tenant_id != ${excludeTenantId} LIMIT 1`)
    : await db.execute(sql`SELECT 1 FROM booking_profiles WHERE slug = ${slug} LIMIT 1`);
  return result.rows.length === 0;
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

/** Get bookings for a profile on a specific date */
export async function getBookingsForDate(profileId: string, date: string): Promise<Booking[]> {
  const result = await db.execute(sql`
    SELECT * FROM bookings
    WHERE profile_id = ${profileId} AND date = ${date} AND status = 'confirmed'
    ORDER BY start_time
  `);
  return result.rows.map(mapBooking);
}

/** Count bookings for a profile on a date */
export async function countBookingsForDate(profileId: string, date: string): Promise<number> {
  const result = await db.execute(sql`
    SELECT COUNT(*)::int as count FROM bookings
    WHERE profile_id = ${profileId} AND date = ${date} AND status = 'confirmed'
  `);
  return (result.rows[0] as any)?.count ?? 0;
}

/** Get all bookings for a tenant (host's view) */
export async function getBookingsForTenant(tenantId: string, status?: string): Promise<Booking[]> {
  if (status) {
    const result = await db.execute(sql`
      SELECT * FROM bookings WHERE tenant_id = ${tenantId} AND status = ${status}
      ORDER BY date DESC, start_time DESC
    `);
    return result.rows.map(mapBooking);
  }
  const result = await db.execute(sql`
    SELECT * FROM bookings WHERE tenant_id = ${tenantId}
    ORDER BY date DESC, start_time DESC
  `);
  return result.rows.map(mapBooking);
}

/** Create a booking */
export async function createBooking(input: {
  tenantId: string; profileId: string; guestName: string; guestEmail: string;
  notes: string; date: string; startTime: string; endTime: string;
  durationMinutes: number; timezone: string; googleEventId?: string; meetLink?: string;
}): Promise<Booking> {
  const result = await db.execute(sql`
    INSERT INTO bookings (
      tenant_id, profile_id, guest_name, guest_email, notes,
      date, start_time, end_time, duration_minutes, timezone,
      google_event_id, meet_link, status
    ) VALUES (
      ${input.tenantId}, ${input.profileId}, ${input.guestName}, ${input.guestEmail},
      ${input.notes}, ${input.date}, ${input.startTime}, ${input.endTime},
      ${input.durationMinutes}, ${input.timezone},
      ${input.googleEventId ?? null}, ${input.meetLink ?? null}, 'confirmed'
    ) RETURNING *
  `);
  return mapBooking(result.rows[0]);
}

/** Cancel a booking */
export async function cancelBooking(bookingId: string, tenantId: string): Promise<boolean> {
  const result = await db.execute(sql`
    UPDATE bookings SET status = 'cancelled' WHERE id = ${bookingId} AND tenant_id = ${tenantId}
  `);
  return (result.rowCount ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// OTPs
// ---------------------------------------------------------------------------

/** Create an OTP */
export async function createOtp(email: string, slug: string, code: string, ip: string | null): Promise<BookingOtp> {
  // Expire in 10 minutes
  const result = await db.execute(sql`
    INSERT INTO booking_otps (email, slug, code, expires_at, ip_address)
    VALUES (${email}, ${slug}, ${code}, now() + interval '10 minutes', ${ip})
    RETURNING *
  `);
  return mapOtp(result.rows[0]);
}

/** Verify an OTP — returns true if valid, increments attempts */
export async function verifyOtp(email: string, slug: string, code: string): Promise<{ valid: boolean; reason?: string }> {
  // Find the latest unexpired, unverified OTP for this email + slug
  const result = await db.execute(sql`
    SELECT * FROM booking_otps
    WHERE email = ${email} AND slug = ${slug} AND verified = false AND expires_at > now()
    ORDER BY created_at DESC LIMIT 1
  `);

  const row = result.rows[0] as Record<string, unknown> | undefined;
  if (!row) return { valid: false, reason: 'No valid OTP found. Please request a new code.' };

  const attempts = (row.attempts as number) ?? 0;
  if (attempts >= 3) return { valid: false, reason: 'Too many attempts. Please request a new code.' };

  // Increment attempts
  await db.execute(sql`UPDATE booking_otps SET attempts = attempts + 1 WHERE id = ${row.id as string}`);

  if (row.code !== code) return { valid: false, reason: 'Invalid code. Please try again.' };

  // Mark as verified
  await db.execute(sql`UPDATE booking_otps SET verified = true WHERE id = ${row.id as string}`);
  return { valid: true };
}

/** Check if email has a verified OTP for this slug (within last 30 min) */
export async function hasVerifiedOtp(email: string, slug: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT 1 FROM booking_otps
    WHERE email = ${email} AND slug = ${slug} AND verified = true
    AND created_at > now() - interval '30 minutes'
    LIMIT 1
  `);
  return result.rows.length > 0;
}

/** Count OTPs sent to an email in the last hour */
export async function countRecentOtps(email: string): Promise<number> {
  const result = await db.execute(sql`
    SELECT COUNT(*)::int as count FROM booking_otps
    WHERE email = ${email} AND created_at > now() - interval '1 hour'
  `);
  return (result.rows[0] as any)?.count ?? 0;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapProfile(row: Record<string, unknown>): BookingProfile {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    slug: String(row.slug),
    displayName: String(row.display_name ?? ''),
    bio: String(row.bio ?? ''),
    timezone: String(row.timezone ?? 'UTC'),
    availableDays: parseJsonArray(row.available_days, [1,2,3,4,5]),
    hoursStart: String(row.hours_start ?? '09:00'),
    hoursEnd: String(row.hours_end ?? '17:00'),
    durationOptions: parseJsonArray(row.duration_options, [15,30,60]),
    defaultDuration: Number(row.default_duration ?? 30),
    bufferMinutes: Number(row.buffer_minutes ?? 10),
    maxAdvanceDays: Number(row.max_advance_days ?? 30),
    maxBookingsPerDay: Number(row.max_bookings_per_day ?? 10),
    meetingTitleTemplate: String(row.meeting_title_template ?? ''),
    includeMeet: Boolean(row.include_meet),
    isActive: Boolean(row.is_active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapBooking(row: Record<string, unknown>): Booking {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    profileId: String(row.profile_id),
    guestName: String(row.guest_name),
    guestEmail: String(row.guest_email),
    notes: String(row.notes ?? ''),
    date: String(row.date),
    startTime: String(row.start_time),
    endTime: String(row.end_time),
    durationMinutes: Number(row.duration_minutes),
    timezone: String(row.timezone),
    googleEventId: row.google_event_id ? String(row.google_event_id) : null,
    meetLink: row.meet_link ? String(row.meet_link) : null,
    status: String(row.status) as 'confirmed' | 'cancelled',
    createdAt: String(row.created_at),
  };
}

function mapOtp(row: Record<string, unknown>): BookingOtp {
  return {
    id: String(row.id),
    email: String(row.email),
    slug: String(row.slug),
    code: String(row.code),
    expiresAt: String(row.expires_at),
    attempts: Number(row.attempts),
    verified: Boolean(row.verified),
    ipAddress: row.ip_address ? String(row.ip_address) : null,
  };
}

function parseJsonArray(val: unknown, fallback: number[]): number[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed : fallback; } catch { return fallback; }
  }
  return fallback;
}

/** Convert BookingProfile to public-safe shape (no tenant info) */
export function toPublicProfile(p: BookingProfile): PublicProfile {
  return {
    slug: p.slug,
    displayName: p.displayName,
    bio: p.bio,
    timezone: p.timezone,
    availableDays: p.availableDays,
    hoursStart: p.hoursStart,
    hoursEnd: p.hoursEnd,
    durationOptions: p.durationOptions,
    defaultDuration: p.defaultDuration,
    maxAdvanceDays: p.maxAdvanceDays,
    isActive: p.isActive,
  };
}

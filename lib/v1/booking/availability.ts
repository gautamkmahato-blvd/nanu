// lib/v1/booking/availability.ts
// Calculates available time slots for a given date.
// Returns both available and booked slots (booked shown disabled in UI).

import type { BookingProfile, TimeSlot } from './types';
import { getBookingsForDate } from './queries';

export type AvailabilityResult = {
  available: TimeSlot[];
  booked: TimeSlot[];
};

// ---------------------------------------------------------------------------
// Main: get slots for a date
// ---------------------------------------------------------------------------

export async function getAvailableSlots(
  profile: BookingProfile,
  date: string,
  durationMinutes: number,
): Promise<AvailabilityResult> {
  const empty: AvailabilityResult = { available: [], booked: [] };

  // Validate date range
  const dateObj = new Date(date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dateObj < today) return empty;
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + profile.maxAdvanceDays);
  if (dateObj > maxDate) return empty;

  // Check day of week
  const dayOfWeek = dateObj.getDay();
  if (!profile.availableDays.includes(dayOfWeek)) return empty;

  // Validate duration
  if (!profile.durationOptions.includes(durationMinutes)) return empty;

  // Generate all possible slots
  const allSlots = generateSlots(profile.hoursStart, profile.hoursEnd, durationMinutes);
  if (allSlots.length === 0) return empty;

  // Fetch busy times from Google Calendar
  const busyPeriods = await fetchBusyTimes(profile.tenantId, date, profile.timezone);

  // Fetch existing bookings
  const existingBookings = await getBookingsForDate(profile.id, date);
  const bookingPeriods = existingBookings.map((b) => ({ start: b.startTime, end: b.endTime }));
  for (const bp of bookingPeriods) busyPeriods.push(bp);

  const isDateToday = isToday(date);
  const nowMinutes = isDateToday ? new Date().getHours() * 60 + new Date().getMinutes() + 15 : 0;

  const available: TimeSlot[] = [];
  const booked: TimeSlot[] = [];

  for (const slot of allSlots) {
    const slotStartMin = timeToMinutes(slot.start);
    const slotEndMin = timeToMinutes(slot.end);

    // If today, filter past slots (15 min buffer from now)
    if (isDateToday && slotStartMin < nowMinutes) {
      booked.push(slot); // Show as unavailable
      continue;
    }

    // Check overlap with busy periods (with buffer)
    let isBusy = false;
    for (const busy of busyPeriods) {
      const busyStartMin = timeToMinutes(busy.start) - profile.bufferMinutes;
      const busyEndMin = timeToMinutes(busy.end) + profile.bufferMinutes;
      if (slotStartMin < busyEndMin && slotEndMin > busyStartMin) {
        isBusy = true;
        break;
      }
    }

    if (isBusy) booked.push(slot);
    else available.push(slot);
  }

  return { available, booked };
}

// ---------------------------------------------------------------------------
// Generate slots
// ---------------------------------------------------------------------------

function generateSlots(start: string, end: string, durationMinutes: number): TimeSlot[] {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  const slots: TimeSlot[] = [];
  for (let m = startMin; m + durationMinutes <= endMin; m += durationMinutes) {
    slots.push({ start: minutesToTime(m), end: minutesToTime(m + durationMinutes) });
  }
  return slots;
}

// ---------------------------------------------------------------------------
// Fetch busy times from Google Calendar (direct API call)
// ---------------------------------------------------------------------------

async function fetchBusyTimes(
  tenantId: string,
  date: string,
  timezone: string,
): Promise<{ start: string; end: string }[]> {
  try {
    // Dynamic import to avoid circular deps
    const { corsair } = await import('@/corsair');
    const tenant = corsair.withTenant(tenantId);

    let accessToken: string | null = null;
    try {
      accessToken = await tenant.googlecalendar.keys.get_access_token();
    } catch {
      // Try refreshing
      try {
        const { getFreshAccessToken } = await import('./token');
        accessToken = await getFreshAccessToken(tenantId, 'googlecalendar');
      } catch { return []; }
    }

    if (!accessToken) return [];

    const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timeMin: `${date}T00:00:00`,
        timeMax: `${date}T23:59:59`,
        timeZone: timezone,
        items: [{ id: 'primary' }],
      }),
    });

    if (res.status === 401) {
      // Token expired — try refresh
      try {
        const { getFreshAccessToken } = await import('./token');
        const freshToken = await getFreshAccessToken(tenantId, 'googlecalendar');
        const retryRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
          method: 'POST',
          headers: { Authorization: `Bearer ${freshToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timeMin: `${date}T00:00:00`, timeMax: `${date}T23:59:59`,
            timeZone: timezone, items: [{ id: 'primary' }],
          }),
        });
        if (!retryRes.ok) return [];
        const retryData = await retryRes.json();
        return (retryData?.calendars?.primary?.busy ?? []).map((p: any) => ({
          start: isoToTimeInTz(p.start, timezone), end: isoToTimeInTz(p.end, timezone),
        }));
      } catch { return []; }
    }

    if (!res.ok) return [];
    const data = await res.json();
    return (data?.calendars?.primary?.busy ?? []).map((p: any) => ({
      start: isoToTimeInTz(p.start, timezone), end: isoToTimeInTz(p.end, timezone),
    }));
  } catch (err) {
    console.error('[booking:availability] fetch busy failed:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeToMinutes(t: string): number { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
function minutesToTime(m: number): string { return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; }
function isoToTimeInTz(iso: string, tz: string): string {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(new Date(iso));
}
function isToday(date: string): boolean {
  const d = new Date(date + 'T00:00:00'); const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

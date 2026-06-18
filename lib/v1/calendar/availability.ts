// lib/v1/calendar/availability.ts
// Checks free/busy availability and computes free slots.

import type { AvailabilityResult, BusySlot, FreeSlot } from './types';

/**
 * Get free/busy availability for the primary calendar.
 * Returns busy periods + computed free slots within the range.
 */
export async function getAvailability(
  timeMin: string,
  timeMax: string,
  tenantId = 'default',
): Promise<AvailabilityResult> {
  const { corsair } = await import('@/corsair');
  const tenant = corsair.withTenant(tenantId);

  const response = await tenant.googlecalendar.api.calendar.getAvailability({
    timeMin,
    timeMax,
    items: [{ id: 'primary' }],
  });

  // Extract busy slots from the response
  const calendars = response.calendars as Record<string, { busy?: { start: string; end: string }[] }> | undefined;
  const primaryBusy = calendars?.primary?.busy ?? [];

  const busy: BusySlot[] = primaryBusy.map((b) => ({
    start: new Date(b.start).toISOString(),
    end: new Date(b.end).toISOString(),
  }));

  // Compute free slots between busy periods
  const free = computeFreeSlots(timeMin, timeMax, busy);

  return {
    busy,
    free,
    timeMin: new Date(timeMin).toISOString(),
    timeMax: new Date(timeMax).toISOString(),
  };
}

/**
 * Given a time range and busy periods, compute the free gaps.
 * Only returns slots during working hours (8 AM - 7 PM).
 * Free slots shorter than 15 minutes are excluded.
 */
function computeFreeSlots(
  rangeStart: string,
  rangeEnd: string,
  busy: BusySlot[],
): FreeSlot[] {
  const WORK_HOUR_START = 8;  // 8 AM
  const WORK_HOUR_END = 19;   // 7 PM
  const MIN_SLOT_MINUTES = 15;

  const start = new Date(rangeStart).getTime();
  const end = new Date(rangeEnd).getTime();

  // Sort busy periods by start time
  const sorted = [...busy].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const free: FreeSlot[] = [];

  // Iterate day by day
  const dayMs = 24 * 60 * 60 * 1000;
  let dayStart = new Date(rangeStart);
  dayStart.setHours(0, 0, 0, 0);

  while (dayStart.getTime() < end) {
    const workStart = new Date(dayStart);
    workStart.setHours(WORK_HOUR_START, 0, 0, 0);

    const workEnd = new Date(dayStart);
    workEnd.setHours(WORK_HOUR_END, 0, 0, 0);

    // Skip if work hours are outside the requested range
    if (workEnd.getTime() <= start || workStart.getTime() >= end) {
      dayStart = new Date(dayStart.getTime() + dayMs);
      continue;
    }

    // Clamp to requested range
    const effectiveStart = Math.max(workStart.getTime(), start);
    const effectiveEnd = Math.min(workEnd.getTime(), end);

    // Find busy periods that overlap with this day's work hours
    const dayBusy = sorted.filter((b) => {
      const bStart = new Date(b.start).getTime();
      const bEnd = new Date(b.end).getTime();
      return bStart < effectiveEnd && bEnd > effectiveStart;
    });

    // Compute free gaps
    let cursor = effectiveStart;
    for (const b of dayBusy) {
      const bStart = Math.max(new Date(b.start).getTime(), effectiveStart);
      const bEnd = Math.min(new Date(b.end).getTime(), effectiveEnd);

      if (bStart > cursor) {
        const durationMin = (bStart - cursor) / 60000;
        if (durationMin >= MIN_SLOT_MINUTES) {
          free.push({
            start: new Date(cursor).toISOString(),
            end: new Date(bStart).toISOString(),
          });
        }
      }
      cursor = Math.max(cursor, bEnd);
    }

    // Remaining time after last busy period
    if (cursor < effectiveEnd) {
      const durationMin = (effectiveEnd - cursor) / 60000;
      if (durationMin >= MIN_SLOT_MINUTES) {
        free.push({
          start: new Date(cursor).toISOString(),
          end: new Date(effectiveEnd).toISOString(),
        });
      }
    }

    dayStart = new Date(dayStart.getTime() + dayMs);
  }

  return free;
}

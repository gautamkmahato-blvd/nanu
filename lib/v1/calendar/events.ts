// lib/v1/calendar/events.ts
// Fetches calendar events from Google Calendar via Corsair.
// Uses lazy import to avoid any circular dependency risk.

import type { CalendarEvent, EventAttendee } from './types';

type RawEvent = Record<string, unknown>;
type RawAttendee = {
  email?: string;
  displayName?: string;
  responseStatus?: string;
  self?: boolean;
  organizer?: boolean;
};

/**
 * Fetch calendar events for a date range.
 * @param timeMin ISO string — start of range
 * @param timeMax ISO string — end of range
 */
export async function fetchCalendarEvents(
  timeMin: string,
  timeMax: string,
  tenantId = 'default',
): Promise<CalendarEvent[]> {
  const { corsair } = await import('@/corsair');
  const tenant = corsair.withTenant(tenantId);

  const response = await tenant.googlecalendar.api.events.getMany({
    calendarId: 'primary',
    timeMin,
    timeMax,
    singleEvents: true,   // flatten recurring events
    orderBy: 'startTime',
    maxResults: 100,
    showHiddenInvitations: true,
    showDeleted: true,
  });

  const items = (response.items ?? []) as RawEvent[];
 
  return items
    .filter((item) => item.status !== 'cancelled')
    .map((item) => parseEvent(item));
}

function parseEvent(raw: RawEvent): CalendarEvent {
  const start = raw.start as { date?: string; dateTime?: string; timeZone?: string } | undefined;
  const end = raw.end as { date?: string; dateTime?: string; timeZone?: string } | undefined;
  const isAllDay = Boolean(start?.date && !start?.dateTime);

  const rawAttendees = (raw.attendees ?? []) as RawAttendee[];
  const attendees: EventAttendee[] = rawAttendees.map((a) => ({
    email: a.email ?? '',
    displayName: a.displayName ?? null,
    responseStatus: (a.responseStatus as EventAttendee['responseStatus']) ?? 'needsAction',
    self: Boolean(a.self),
    organizer: Boolean(a.organizer),
  }));

  const creator = raw.creator as { email?: string; displayName?: string; self?: boolean } | undefined;
  const organizer = raw.organizer as { email?: string; displayName?: string; self?: boolean } | undefined;

  return {
    id: String(raw.id ?? ''),
    summary: String(raw.summary ?? '(No title)'),
    description: (raw.description as string) ?? null,
    location: (raw.location as string) ?? null,
    status: (raw.status as CalendarEvent['status']) ?? 'confirmed',
    htmlLink: (raw.htmlLink as string) ?? null,
    startTime: isAllDay
      ? new Date(start!.date!).toISOString()
      : new Date(start?.dateTime ?? '').toISOString(),
    endTime: isAllDay
      ? new Date(end?.date ?? '').toISOString()
      : new Date(end?.dateTime ?? '').toISOString(),
    isAllDay,
    attendees,
    organizer: organizer?.email
      ? { email: organizer.email, displayName: organizer.displayName ?? null, self: Boolean(organizer.self) }
      : null,
    creator: creator?.email
      ? { email: creator.email, displayName: creator.displayName ?? null }
      : null,
    hangoutLink: (raw.hangoutLink as string) ?? null,
    eventType: String(raw.eventType ?? 'default'),
    colorId: (raw.colorId as string) ?? null,
  };
}

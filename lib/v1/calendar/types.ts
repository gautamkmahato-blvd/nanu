// lib/v1/calendar/types.ts

export type CalendarEvent = {
  id: string;
  summary: string;
  description: string | null;
  location: string | null;
  status: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink: string | null;
  startTime: string;        // ISO string
  endTime: string;           // ISO string
  isAllDay: boolean;
  attendees: EventAttendee[];
  organizer: { email: string; displayName: string | null; self: boolean } | null;
  creator: { email: string; displayName: string | null } | null;
  hangoutLink: string | null;
  eventType: string;
  colorId: string | null;
};

export type EventAttendee = {
  email: string;
  displayName: string | null;
  responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  self: boolean;
  organizer: boolean;
};

export type FreeSlot = {
  start: string;
  end: string;
};

export type BusySlot = {
  start: string;
  end: string;
};

export type AvailabilityResult = {
  busy: BusySlot[];
  free: FreeSlot[];
  timeMin: string;
  timeMax: string;
};

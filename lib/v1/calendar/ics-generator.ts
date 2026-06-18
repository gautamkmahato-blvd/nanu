// lib/v1/calendar/ics-generator.ts
// Generates an .ics (iCalendar) file string for meeting invitations.
// The .ics attachment enables Accept/Decline in Gmail, Outlook, Apple Mail.

type IcsInput = {
  uid: string;              // unique event ID
  title: string;
  description?: string;
  startTime: string;        // ISO string
  endTime: string;          // ISO string
  location?: string;        // meet link or physical location
  organizerName: string;
  organizerEmail: string;
  attendees: { email: string; name?: string }[];
};

export function generateIcs(input: IcsInput): string {
  const { uid, title, description, startTime, endTime, location, organizerName, organizerEmail, attendees } = input;

  const dtStart = toIcsDateTime(startTime);
  const dtEnd = toIcsDateTime(endTime);
  const now = toIcsDateTime(new Date().toISOString());

  const attendeeLines = attendees.map((a) => {
    const cn = a.name ? `;CN=${escapeIcs(a.name)}` : '';
    return `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE${cn}:mailto:${a.email}`;
  }).join('\r\n');

  const descLine = description
    ? `DESCRIPTION:${escapeIcs(description)}`
    : '';

  const locationLine = location
    ? `LOCATION:${escapeIcs(location)}`
    : '';

  // CRLF line endings required by iCalendar spec (RFC 5545)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ContextMode//Meeting//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcs(title)}`,
    descLine,
    locationLine,
    `ORGANIZER;CN=${escapeIcs(organizerName)}:mailto:${organizerEmail}`,
    attendeeLines,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    `CREATED:${now}`,
    `LAST-MODIFIED:${now}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Meeting in 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return lines.join('\r\n') + '\r\n';
}

// Convert ISO string to ICS datetime format: 20260616T080000Z
function toIcsDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

// Escape special characters per RFC 5545
function escapeIcs(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

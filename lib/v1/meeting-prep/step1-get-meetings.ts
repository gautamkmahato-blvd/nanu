// lib/v1/meeting-prep/step1-get-meetings.ts
// Step 1: Fetch all meetings happening in the next N hours
//         that have at least 1 external attendee.

import { sql } from 'drizzle-orm';
import type { Meeting, MeetingAttendee, StepResult } from './types';
import { db } from '@/db';

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function getMeetings(hours: number = 24): Promise<StepResult<Meeting[]>> {
  try {
    const meetings = await fetchCalendarEvents(hours);
    const withAttendees = filterMeetingsWithAttendees(meetings);

    if (withAttendees.length === 0) {
      return { ok: true, data: [] };
    }

    // Enrich attendees with relationship type from our emails DB
    const enriched = await enrichAttendeesFromDB(withAttendees);

    return { ok: true, data: enriched };
  } catch (err) {
    return { ok: false, error: `Step 1 failed: ${err instanceof Error ? err.message : 'Unknown'}` };
  }
}

// ---------------------------------------------------------------------------
// Sub-step 1a: Fetch events from calendar API
// ---------------------------------------------------------------------------

async function fetchCalendarEvents(hours: number): Promise<Meeting[]> {
  const now = new Date();
  const end = new Date(now.getTime() + hours * 60 * 60 * 1000);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/v1/calendar/events?start=${now.toISOString()}&end=${end.toISOString()}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error(`Calendar API returned ${res.status}`);
  }

  const data = await res.json();
  const events = data.events ?? [];

  return events.map((e: any) => ({
    id: e.id,
    summary: e.summary ?? 'Untitled Meeting',
    description: e.description ?? null,
    location: e.location ?? null,
    startTime: e.startTime,
    endTime: e.endTime,
    hangoutLink: e.hangoutLink ?? null,
    htmlLink: e.htmlLink ?? null,
    attendees: (e.attendees ?? []).map((a: any) => ({
      email: a.email,
      name: a.displayName ?? null,
      responseStatus: a.responseStatus ?? 'needsAction',
      self: a.self ?? false,
      organizer: a.organizer ?? false,
      relationshipType: null, // enriched later
    })),
  }));
}

// ---------------------------------------------------------------------------
// Sub-step 1b: Filter to meetings with external attendees
// ---------------------------------------------------------------------------

function filterMeetingsWithAttendees(meetings: Meeting[]): Meeting[] {
  return meetings.filter((m) => {
    const external = m.attendees.filter((a) => !a.self);
    return external.length > 0;
  });
}

// ---------------------------------------------------------------------------
// Sub-step 1c: Enrich attendees with relationship type from DB
// ---------------------------------------------------------------------------

async function enrichAttendeesFromDB(meetings: Meeting[]): Promise<Meeting[]> {
  // Collect all unique external attendee emails
  const allEmails = new Set<string>();
  for (const m of meetings) {
    for (const a of m.attendees) {
      if (!a.self) allEmails.add(a.email);
    }
  }

  if (allEmails.size === 0) return meetings;

  // Query emails table for relationship types
  const emailList = Array.from(allEmails);
  let relationshipMap: Record<string, string> = {};

  try {
    const rows = await db.execute(sql`
      SELECT DISTINCT from_email, ai_analysis->>'relationship_type' as relationship_type
      FROM emails
      WHERE from_email = ANY(${emailList})
        AND ai_analysis->>'relationship_type' IS NOT NULL
        AND ai_analysis->>'relationship_type' != 'other'
      ORDER BY from_email
    `);

    for (const row of rows.rows) {
      const email = row.from_email as string;
      const rel = row.relationship_type as string;
      if (email && rel) relationshipMap[email] = rel;
    }
  } catch {
    // DB enrichment is optional — don't fail the pipeline
    console.warn('[Step 1c] Could not enrich attendees from DB');
  }

  // Apply to meetings
  return meetings.map((m) => ({
    ...m,
    attendees: m.attendees.map((a) => ({
      ...a,
      relationshipType: relationshipMap[a.email] ?? null,
    })),
  }));
}

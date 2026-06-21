// app/api/v1/calendar/events/route.ts
// GET: Fetch events. POST: Create event with optional Google Meet link.
// TIMEZONE FIX: Frontend sends timeZone (e.g. "Asia/Kolkata"), backend passes
// it to Google Calendar API instead of converting via new Date().toISOString().

import { NextResponse } from 'next/server';
import { fetchCalendarEvents } from '@/lib/v1/calendar/events';
import { getTenantId } from '@/lib/auth/session';
import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

// ---- GET: List events ----

export async function GET(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


  const rl = await rateLimit(request, apiLimiter, tenantId); if (rl) return rl;

  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
    const defaultEnd = new Date(startOfToday); defaultEnd.setDate(defaultEnd.getDate() + 42);
    const timeMin = searchParams.get('start') ?? startOfToday.toISOString();
    const timeMax = searchParams.get('end') ?? defaultEnd.toISOString();

    if (isNaN(new Date(timeMin).getTime()) || isNaN(new Date(timeMax).getTime())) {
      return NextResponse.json({ error: 'Invalid date format.' }, { status: 400 });
    }

    const events = await fetchCalendarEvents(timeMin, timeMax, tenantId);

    // Group by LOCAL date
    const byDay: Record<string, typeof events> = {};
    for (const event of events) {
      const d = new Date(event.startTime);
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!byDay[dayKey]) byDay[dayKey] = [];
      byDay[dayKey].push(event);
    }

    const totalEvents = events.length;
    const totalMeetings = events.filter((e) => e.attendees.length > 0).length;
    const uniqueAttendees = new Set(events.flatMap((e) => e.attendees.filter((a) => !a.self).map((a) => a.email))).size;
    let busiestDay = ''; let busiestCount = 0;
    for (const [day, dayEvents] of Object.entries(byDay)) { if (dayEvents.length > busiestCount) { busiestDay = day; busiestCount = dayEvents.length; } }

    const attendeesList: { email: string; name: string | null }[] = [];
    const seenEmails = new Set<string>();
    for (const e of events) { for (const a of e.attendees) { if (!a.self && !seenEmails.has(a.email)) { seenEmails.add(a.email); attendeesList.push({ email: a.email, name: a.displayName }); } } }

    return NextResponse.json({ events, byDay, total: events.length, stats: { totalEvents, totalMeetings, uniqueAttendees, busiestDay, busiestDayCount: busiestCount, daysWithEvents: Object.keys(byDay).length }, attendeesList, timeMin, timeMax });
  } catch (error) {
    console.error('[calendar] events fetch failed:', error);
    const msg = error instanceof Error ? error.message : 'Failed';
    const isAuthError = msg.includes('auth') || msg.includes('token') || msg.includes('credential') || msg.includes('not found');
    return NextResponse.json({ error: isAuthError ? 'Google Calendar not connected.' : msg }, { status: isAuthError ? 401 : 500 });
  }
}

// ---- POST: Create event ----
// Body: { summary, description?, location?, startDateTime, endDateTime, attendeeEmails?, meetingType?, zoomLink?, timeZone? }

export async function POST(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { summary, description, location, startDateTime, endDateTime, attendeeEmails, meetingType, zoomLink, skipNotification, timeZone } = body;

    if (!summary || !startDateTime || !endDateTime) {
      return NextResponse.json({ error: 'summary, startDateTime, endDateTime are required' }, { status: 400 });
    }

    // Validate times
    // Use the raw datetime strings with timezone instead of converting to UTC
    // Frontend sends: "2026-06-19T10:00:00" + timeZone: "Asia/Kolkata"
    // Google Calendar API accepts dateTime + timeZone directly

    const { corsair } = await import('@/corsair');
    const tenant = corsair.withTenant(tenantId);

    const attendees = Array.isArray(attendeeEmails)
      ? attendeeEmails.filter((e: string) => e.includes('@')).map((email: string) => ({ email }))
      : [];

    // Resolve the user's timezone — fall back to server's timezone or UTC
    const userTimeZone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    // Build event body — pass datetime + timezone to Google Calendar
    // DO NOT convert with new Date().toISOString() — that loses the user's timezone
    const eventBody: Record<string, unknown> = {
      summary,
      start: { dateTime: startDateTime, timeZone: userTimeZone },
      end: { dateTime: endDateTime, timeZone: userTimeZone },
      attendees,
    };

    if (description) eventBody.description = description;

    // Handle meeting link type
    if (meetingType === 'zoom' && zoomLink) {
      eventBody.location = zoomLink;
      eventBody.description = (description ? description + '\n\n' : '') + `Zoom Meeting: ${zoomLink}`;
    } else if (location) {
      eventBody.location = location;
    }

    // Create with conference data version for Google Meet
    const createParams: Record<string, unknown> = {
      calendarId: 'primary',
      sendUpdates: skipNotification ? 'none' : 'all',
      event: eventBody,
    };

    // If Google Meet requested, add conference data
    if (meetingType === 'meet') {
      createParams.conferenceDataVersion = 1;
      (eventBody as Record<string, unknown>).conferenceData = {
        createRequest: {
          requestId: `ctx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      };
    }

    const event = await tenant.googlecalendar.api.events.create(createParams as Parameters<typeof tenant.googlecalendar.api.events.create>[0]);

    // Extract the Meet link from response
    const hangoutLink = (event as Record<string, unknown>).hangoutLink as string | undefined;
    const conferenceData = (event as Record<string, unknown>).conferenceData as Record<string, unknown> | undefined;
    const meetLink = hangoutLink
      ?? (conferenceData?.entryPoints as { uri: string }[] | undefined)?.[0]?.uri
      ?? null;

    return NextResponse.json({
      success: true,
      event: {
        id: (event as Record<string, unknown>).id,
        summary: (event as Record<string, unknown>).summary,
        htmlLink: (event as Record<string, unknown>).htmlLink,
        hangoutLink: meetLink,
        start: (event as Record<string, unknown>).start,
        end: (event as Record<string, unknown>).end,
      },
      meetLink,
    }, { status: 201 });
  } catch (error) {
    console.error('[calendar] create event failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create event' }, { status: 500 });
  }
}
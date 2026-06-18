// app/api/v1/calendar/meeting-prep/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runMeetingPrepPipeline } from '@/lib/v1/meeting-prep/pipeline';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hours = Math.min(Number(searchParams.get('hours') ?? 24), 72);
    const limit = Math.min(Number(searchParams.get('limit') ?? 10), 20);

    const result = await runMeetingPrepPipeline(hours);

    const events = result.events.slice(0, limit);

    const response = {
      events: events.map((e) => ({
        id: e.meeting.id,
        summary: e.meeting.summary,
        startTime: e.meeting.startTime,
        endTime: e.meeting.endTime,
        hangoutLink: e.meeting.hangoutLink,
        htmlLink: e.meeting.htmlLink,
        location: e.meeting.location,
        description: e.meeting.description,
        attendeePrep: (e.prep.attendeeNotes ?? []).map((n) => ({
          email: n.email,
          name: n.name,
          responseStatus: n.responseStatus,
          emailsReceived: n.emailCount,
          emailsSent: 0,
          lastInteraction: null,
          relationshipType: null,
          sentiment: null,
          recentTopics: [],
          pendingItems: [],
          relevantEmails: [],
        })),
        prepSummary: `${e.prep.emailsUsed} emails analyzed${e.fromCache ? ' (cached)' : ''}`,
        aiPrep: {
          briefing: e.prep.briefing,
          talkingPoints: e.prep.talkingPoints,
          openItems: e.prep.openItems,
          riskFlags: e.prep.riskFlags,
          suggestedApproach: e.prep.suggestedApproach,
          attendeeNotes: Object.fromEntries((e.prep.attendeeNotes ?? []).map((n) => [n.email, n.note])),
        },
      })),
      errors: result.errors,
      success: result.success,
      // Debug info — remove in production
      debug: result.debug,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[meeting-prep route]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Meeting prep failed', events: [], success: false, debug: [] },
      { status: 500 }
    );
  }
}

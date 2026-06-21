// app/api/v1/calendar/meeting-prep/route.ts
// API route for the meeting prep pipeline.
// Updated: includes relatedEmails in the response for the "View Related Emails" panel.

import { NextRequest, NextResponse } from 'next/server';
import { runMeetingPrepPipeline } from '@/lib/v1/meeting-prep/pipeline';
import { getSession, getTenantId } from '@/lib/auth/session';
import { aiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

export async function GET(req: NextRequest) {
  try {
    // ── Auth ──
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    // add inside each handler: 
    const rl = await rateLimit(req, aiLimiter, tenantId); if (rl) return rl;

    // ── Params ──
    const { searchParams } = new URL(req.url);
    const hours = Math.min(Math.max(parseInt(searchParams.get('hours') ?? '24', 10) || 24, 1), 168); // 1h–7d
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') ?? '10', 10) || 10, 1), 25);

    // ── Run pipeline ──
    const result = await runMeetingPrepPipeline(hours, session.userId);

    // ── Map pipeline output → API response ──
    const events = result.events.slice(0, limit).map((output) => {
      const m = output.meeting;
      const p = output.prep;

      return {
        id: m.id,
        summary: m.summary,
        startTime: m.startTime,
        endTime: m.endTime,
        hangoutLink: m.hangoutLink,
        htmlLink: m.htmlLink,
        location: m.location,
        description: m.description,

        // Attendee prep: merge AI notes with attendee data
        attendeePrep: m.attendees.map((att) => {
          const aiNote = p.attendeeNotes.find((n) => n.email === att.email);
          return {
            email: att.email,
            name: att.name,
            responseStatus: att.responseStatus,
            emailsReceived: aiNote?.emailCount ?? 0,
            emailsSent: 0, // TODO: track sent count if needed
          };
        }),

        prepSummary: p.emailsUsed > 0 ? `${p.emailsUsed} emails analyzed` : 'No emails found',

        aiPrep: {
          briefing: p.briefing,
          talkingPoints: p.talkingPoints,
          openItems: p.openItems,
          riskFlags: p.riskFlags,
          suggestedApproach: p.suggestedApproach,
          attendeeNotes: Object.fromEntries(
            p.attendeeNotes.map((n) => [n.email, n.note])
          ),
        },

        // Related emails for the side panel — send only the fields the UI needs
        relatedEmails: (output.relatedEmails ?? []).map((e) => ({
          id: e.id,
          subject: e.subject,
          fromEmail: e.fromEmail,
          fromName: e.fromName,
          snippet: e.snippet,
          receivedAt: e.receivedAt,
          finalScore: e.finalScore,
          relevantToAttendees: e.relevantToAttendees,
        })),
      };
    });

    return NextResponse.json({
      success: result.success,
      events,
      errors: result.errors,
    });
  } catch (err) {
    console.error('[meeting-prep/route] Unhandled error:', err);
    return NextResponse.json(
      { success: false, events: [], errors: [{ meetingId: '', meetingSummary: '', error: 'Internal server error' }] },
      { status: 500 }
    );
  }
}
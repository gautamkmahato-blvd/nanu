// lib/v1/meeting-prep/step6-synthesis.ts
// Step 6: Pass meeting context + email bundles + queries to LLM.
//         Generate briefing, talking points, open items, risks, attendee notes.

import type { MeetingEmailBundles, PrepResult, StepResult, AttendeeBundledEmails } from './types';
import { callLLM, parseLLMJson } from './llm';
import { buildSynthesisPrompt } from './prompts';

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function synthesize(bundles: MeetingEmailBundles[]): Promise<StepResult<PrepResult[]>> {
  try {
    const results: PrepResult[] = [];

    for (const bundle of bundles) {
      const result = await synthesizeMeeting(bundle);
      results.push(result);
    }

    return { ok: true, data: results };
  } catch (err) {
    return { ok: false, error: `Step 6 failed: ${err instanceof Error ? err.message : 'Unknown'}` };
  }
}

// ---------------------------------------------------------------------------
// Sub-step 6a: Synthesize prep for a single meeting
// ---------------------------------------------------------------------------

async function synthesizeMeeting(bundle: MeetingEmailBundles): Promise<PrepResult> {
  const meeting = bundle.meeting;

  if (bundle.totalRetrieved === 0) {
    return buildEmptyPrep(meeting);
  }

  const attendeeSections = buildAttendeeSections(bundle.attendeeBundles);
  const queriesSection = buildQueriesSection(bundle.attendeeBundles);
  const meetingTime = formatMeetingTime(meeting.startTime, meeting.endTime);

  const prompt = buildSynthesisPrompt(
    meeting.summary,
    meeting.description,
    meetingTime,
    meeting.location,
    attendeeSections,
    queriesSection
  );

  const llmResult = await callLLM(prompt, 3000);

  if (!llmResult.ok) {
    console.warn(`[Step 6a] LLM synthesis failed: ${llmResult.error}`);
    return buildFallbackPrep(meeting, bundle);
  }

  const parsed = parseLLMJson<SynthesisResponse>(llmResult.data);

  if (!parsed.ok) {
    console.warn(`[Step 6a] Synthesis JSON parse failed: ${parsed.error}`);
    return buildFallbackPrep(meeting, bundle);
  }

  return mapSynthesisToPrep(meeting, parsed.data, bundle);
}

// ---------------------------------------------------------------------------
// Sub-step 6b: Build attendee sections for the prompt
// ---------------------------------------------------------------------------

function buildAttendeeSections(attendeeBundles: AttendeeBundledEmails[]): string {
  return attendeeBundles.map((ab) => {
    const label = ab.attendeeName ? `${ab.attendeeName} (${ab.attendeeEmail})` : ab.attendeeEmail;

    if (ab.emails.length === 0) {
      return `### ${label}\nNo relevant emails found for this attendee.`;
    }

    const emailSummaries = ab.emails.map((e, i) => {
      const subject = e.subject ?? '(no subject)';
      const body = (e.bodyText ?? e.snippet ?? '').slice(0, 500);

      // Extract structured AI analysis
      const aiNote = extractAiNote(e.aiResponse);

      return `Email ${i + 1} [score: ${e.finalScore}, match: ${e.matchSource}]:
  Subject: ${subject}
  From: ${e.fromEmail}
  Date: ${e.receivedAt}
  Content: ${body}
  ${aiNote}`;
    }).join('\n\n');

    return `### ${label}\n${emailSummaries}`;
  }).join('\n\n---\n\n');
}

// ---------------------------------------------------------------------------
// Sub-step 6b-helper: Extract useful fields from ai_analysis JSON
// ---------------------------------------------------------------------------

function extractAiNote(aiResponse: string | null): string {
  if (!aiResponse) return '';

  try {
    const ai = typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse;
    const parts: string[] = [];

    if (ai.summary) parts.push(`Summary: ${ai.summary}`);
    if (ai.topics?.length) parts.push(`Topics: ${ai.topics.join(', ')}`);
    if (ai.sentiment) parts.push(`Sentiment: ${ai.sentiment}`);
    if (ai.action_items?.length) {
      const items = ai.action_items.map((a: any) => (typeof a === 'string' ? a : a.task ?? a)).join('; ');
      parts.push(`Action items: ${items}`);
    }
    if (ai.recommended_action) parts.push(`Recommended: ${ai.recommended_action}`);
    if (ai.deadline) parts.push(`Deadline: ${ai.deadline}`);
    if (ai.urgency_score > 50) parts.push(`Urgency: ${ai.urgency_score}/100`);

    return parts.length > 0 ? `AI Analysis: ${parts.join(' | ')}` : '';
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Sub-step 6c: Build queries section for context
// ---------------------------------------------------------------------------

function buildQueriesSection(attendeeBundles: AttendeeBundledEmails[]): string {
  return attendeeBundles.map((ab) => {
    const label = ab.attendeeName ?? ab.attendeeEmail;
    return `- ${label}: ${ab.emails.length} emails retrieved`;
  }).join('\n');
}

// ---------------------------------------------------------------------------
// Sub-step 6d: Map LLM response to PrepResult
// ---------------------------------------------------------------------------

type SynthesisResponse = {
  briefing?: string;
  talkingPoints?: string[];
  openItems?: string[];
  riskFlags?: string[];
  suggestedApproach?: string;
  attendeeNotes?: Record<string, string>;
};

function mapSynthesisToPrep(meeting: any, raw: SynthesisResponse, bundle: MeetingEmailBundles): PrepResult {
  return {
    meetingId: meeting.id,
    meetingSummary: meeting.summary,
    briefing: raw.briefing ?? 'No briefing generated.',
    talkingPoints: Array.isArray(raw.talkingPoints) ? raw.talkingPoints.filter((s) => typeof s === 'string') : [],
    openItems: Array.isArray(raw.openItems) ? raw.openItems.filter((s) => typeof s === 'string') : [],
    riskFlags: Array.isArray(raw.riskFlags) ? raw.riskFlags.filter((s) => typeof s === 'string') : [],
    suggestedApproach: raw.suggestedApproach ?? '',
    attendeeNotes: mapAttendeeNotes(raw.attendeeNotes, bundle),
    emailsUsed: bundle.totalRetrieved,
    generatedAt: new Date().toISOString(),
  };
}

function mapAttendeeNotes(
  rawNotes: Record<string, string> | undefined,
  bundle: MeetingEmailBundles
): PrepResult['attendeeNotes'] {
  return bundle.attendeeBundles.map((ab) => ({
    email: ab.attendeeEmail,
    name: ab.attendeeName,
    note: rawNotes?.[ab.attendeeEmail] ?? 'No specific notes generated.',
    emailCount: ab.emails.length,
    responseStatus: bundle.meeting.attendees.find((a) => a.email === ab.attendeeEmail)?.responseStatus ?? 'needsAction',
  }));
}

// ---------------------------------------------------------------------------
// Sub-step 6e: Fallback prep when LLM fails
// ---------------------------------------------------------------------------

function buildFallbackPrep(meeting: any, bundle: MeetingEmailBundles): PrepResult {
  const subjects = bundle.allEmails
    .slice(0, 5)
    .map((e) => e.subject ?? '(no subject)')
    .join(', ');

  return {
    meetingId: meeting.id,
    meetingSummary: meeting.summary,
    briefing: `AI synthesis unavailable. Found ${bundle.totalRetrieved} related emails. Recent topics: ${subjects || 'none found'}.`,
    talkingPoints: [],
    openItems: [],
    riskFlags: [],
    suggestedApproach: '',
    attendeeNotes: bundle.attendeeBundles.map((ab) => ({
      email: ab.attendeeEmail,
      name: ab.attendeeName,
      note: ab.emails.length > 0
        ? `${ab.emails.length} related emails found. Latest: "${ab.emails[0]?.subject ?? 'no subject'}".`
        : 'No prior email context.',
      emailCount: ab.emails.length,
      responseStatus: meeting.attendees.find((a: any) => a.email === ab.attendeeEmail)?.responseStatus ?? 'needsAction',
    })),
    emailsUsed: bundle.totalRetrieved,
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Sub-step 6f: Empty prep when no emails found
// ---------------------------------------------------------------------------

function buildEmptyPrep(meeting: any): PrepResult {
  return {
    meetingId: meeting.id,
    meetingSummary: meeting.summary,
    briefing: 'No relevant email context found for this meeting. This may be a new topic or the attendees are new contacts.',
    talkingPoints: [],
    openItems: [],
    riskFlags: [],
    suggestedApproach: 'Since there is no email history, consider starting with introductions and setting clear agenda items.',
    attendeeNotes: meeting.attendees
      .filter((a: any) => !a.self)
      .map((a: any) => ({
        email: a.email,
        name: a.name,
        note: 'No prior email context — new contact.',
        emailCount: 0,
        responseStatus: a.responseStatus,
      })),
    emailsUsed: 0,
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function formatMeetingTime(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} ${s.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })} – ${e.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}`;
}
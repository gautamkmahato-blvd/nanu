// lib/v1/meeting-prep/step3-generate-queries.ts
// Step 3: For each meeting × attendee, call the LLM to generate
//         2-3 focused search queries.

import type { Meeting, AttendeeQueries, MeetingQueries, StepResult } from './types';
import { callLLM, parseLLMJson } from './llm';
import { buildQueryGenerationPrompt } from './prompts';

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function generateQueries(meetings: Meeting[], tenantId: string): Promise<StepResult<MeetingQueries[]>> {
  try {
    const results: MeetingQueries[] = [];

    for (const meeting of meetings) {
      const attendeeQueries = await generateQueriesForMeeting(meeting, tenantId);
      results.push({ meeting, attendeeQueries });
    }

    return { ok: true, data: results };
  } catch (err) {
    return { ok: false, error: `Step 3 failed: ${err instanceof Error ? err.message : 'Unknown'}` };
  }
}

// ---------------------------------------------------------------------------
// Sub-step 3a: Generate queries for all attendees of a single meeting
// ---------------------------------------------------------------------------

async function generateQueriesForMeeting(meeting: Meeting, tenantId: string): Promise<AttendeeQueries[]> {
  const externalAttendees = meeting.attendees.filter((a) => !a.self);
  const results: AttendeeQueries[] = [];

  // Process attendees in parallel (bounded concurrency)
  const batchSize = 3;
  for (let i = 0; i < externalAttendees.length; i += batchSize) {
    const batch = externalAttendees.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((attendee) => generateQueriesForAttendee(meeting, attendee.email, attendee.name, attendee.relationshipType, tenantId))
    );
    results.push(...batchResults);
  }

  return results;
}

// ---------------------------------------------------------------------------
// Sub-step 3b: Generate queries for a single attendee
// ---------------------------------------------------------------------------

async function generateQueriesForAttendee(
  meeting: Meeting,
  attendeeEmail: string,
  attendeeName: string | null,
  relationshipType: string | null,
  tenantId: string
): Promise<AttendeeQueries> {
  const prompt = buildQueryGenerationPrompt(
    meeting.summary,
    meeting.description,
    attendeeName,
    attendeeEmail,
    relationshipType
  );
 
  const llmResult = await callLLM(prompt, 500, tenantId);

  // If LLM fails, create fallback queries from meeting title + attendee name
  if (!llmResult.ok) {
    console.warn(`[Step 3b] LLM failed for ${attendeeEmail}: ${llmResult.error}`);
    return buildFallbackQueries(meeting, attendeeEmail, attendeeName);
  }

  const parsed = parseLLMJson<string[]>(llmResult.data);

  // If parsing fails, use fallback
  if (!parsed.ok) {
    console.warn(`[Step 3b] JSON parse failed for ${attendeeEmail}: ${parsed.error}`);
    return buildFallbackQueries(meeting, attendeeEmail, attendeeName);
  }

  // Validate: must be array of strings, 1-5 items, each 2-50 chars
  const queries = validateQueries(parsed.data);

  if (queries.length === 0) {
    return buildFallbackQueries(meeting, attendeeEmail, attendeeName);
  }

  return { attendeeEmail, attendeeName, queries };
}

// ---------------------------------------------------------------------------
// Sub-step 3c: Validate LLM-generated queries
// ---------------------------------------------------------------------------

function validateQueries(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((q): q is string => typeof q === 'string')
    .map((q) => q.trim())
    .filter((q) => q.length >= 2 && q.length <= 100)
    .slice(0, 5); // cap at 5 queries max
}

// ---------------------------------------------------------------------------
// Sub-step 3d: Fallback queries when LLM fails
// ---------------------------------------------------------------------------

function buildFallbackQueries(meeting: Meeting, email: string, name: string | null): AttendeeQueries {
  const label = name ?? email.split('@')[0];
  const title = meeting.summary;

  const queries = [
    `${title}`, // search by meeting title
    `${label}`, // search by attendee name
  ];

  // Add combined query if title is meaningful
  if (title.length > 3 && title.toLowerCase() !== 'meeting') {
    queries.push(`${title} ${label}`);
  }

  return { attendeeEmail: email, attendeeName: name, queries };
}

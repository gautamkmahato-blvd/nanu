// lib/v1/meeting-prep/prompts.ts
// All LLM prompts used in the meeting prep pipeline.
// Keeping them centralized makes it easy to iterate on accuracy.

// ---------------------------------------------------------------------------
// Step 3: Query generation prompt
// ---------------------------------------------------------------------------

export function buildQueryGenerationPrompt(
  meetingTitle: string,
  meetingDescription: string | null,
  attendeeName: string | null,
  attendeeEmail: string,
  relationshipType: string | null
): string {
  const attendeeLabel = attendeeName ? `${attendeeName} (${attendeeEmail})` : attendeeEmail;
  const relContext = relationshipType ? `Their relationship type is: ${relationshipType}.` : '';
  const descContext = meetingDescription ? `Meeting description: ${meetingDescription}` : 'No meeting description provided.';

  return `You are an expert at generating search queries for email retrieval.

Given a meeting and one of its attendees, generate 2-3 short, focused search queries that would find the most relevant past emails for preparing for this meeting.

Each query should be:
- 3-8 words long
- Focused on specific topics, projects, or discussions
- Relevant to BOTH the meeting topic AND this specific attendee
- Different from each other (cover different angles)

Meeting title: ${meetingTitle}
${descContext}
Attendee: ${attendeeLabel}
${relContext}

Respond with ONLY a JSON array of strings. No markdown, no explanation.
Example: ["project phoenix budget review", "Q3 timeline with Ravi", "pending deliverables acme"]`;
}

// ---------------------------------------------------------------------------
// Step 6: Synthesis prompt
// ---------------------------------------------------------------------------

export function buildSynthesisPrompt(
  meetingTitle: string,
  meetingDescription: string | null,
  meetingTime: string,
  meetingLocation: string | null,
  attendeeSections: string,
  originalQueries: string
): string {
  const descLine = meetingDescription ? `Description: ${meetingDescription}` : '';
  const locLine = meetingLocation ? `Location: ${meetingLocation}` : '';

  return `You are an expert meeting preparation assistant. Based on the meeting details and retrieved email context below, generate a comprehensive meeting prep briefing.

## Meeting
Title: ${meetingTitle}
${descLine}
${locLine}
Time: ${meetingTime}

## Search Queries Used
${originalQueries}

## Email Context Per Attendee
${attendeeSections}

---

Generate a JSON object with this exact structure (no markdown, no backticks):
{
  "briefing": "A 2-3 paragraph overview of what this meeting is about based on email context. What has been discussed, what is the current state, what should be addressed.",
  "talkingPoints": ["Point 1 — specific and actionable", "Point 2", "Point 3"],
  "openItems": ["Unresolved item from emails that needs discussion"],
  "riskFlags": ["Any concerns, tensions, or risks spotted in email context"],
  "suggestedApproach": "A 1-2 sentence recommendation on how to approach this meeting",
  "attendeeNotes": {
    "attendee@email.com": "What you should know about this person going into the meeting — their concerns, last topics, pending items"
  }
}

Rules:
- Only include information supported by the email context provided
- If no relevant emails exist for an attendee, say "No prior email context available"
- Keep talking points specific and actionable, not generic
- Risk flags should only include genuine concerns, not filler
- If there's not enough context, say so honestly rather than fabricating
- Return ONLY valid JSON, no markdown formatting`;
}

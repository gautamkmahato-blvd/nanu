// lib/v1/meeting-prep/types.ts
// Shared types for the entire meeting prep pipeline

// ---------------------------------------------------------------------------
// Step 1: Calendar meetings
// ---------------------------------------------------------------------------

export type MeetingAttendee = {
  email: string;
  name: string | null;
  responseStatus: string; // accepted | declined | tentative | needsAction
  self: boolean;
  organizer: boolean;
  relationshipType: string | null; // from your emails DB if available
};

export type Meeting = {
  id: string;
  summary: string;
  description: string | null;
  location: string | null;
  startTime: string;
  endTime: string;
  hangoutLink: string | null;
  htmlLink: string | null;
  attendees: MeetingAttendee[];
};

// ---------------------------------------------------------------------------
// Step 2: Cache
// ---------------------------------------------------------------------------

export type CacheCheckResult = {
  meeting: Meeting;
  cachedPrep: PrepResult | null;
  needsRefresh: boolean;
  reason: 'fresh_cache' | 'stale_cache' | 'no_cache' | 'new_emails';
};

// ---------------------------------------------------------------------------
// Step 3: Query generation
// ---------------------------------------------------------------------------

export type AttendeeQueries = {
  attendeeEmail: string;
  attendeeName: string | null;
  queries: string[];
};

export type MeetingQueries = {
  meeting: Meeting;
  attendeeQueries: AttendeeQueries[];
};

// ---------------------------------------------------------------------------
// Step 4: Search results
// ---------------------------------------------------------------------------

export type ScoredEmail = {
  id: string;
  threadId: string;
  fromEmail: string;
  fromName: string | null;
  subject: string | null;
  bodyText: string | null;
  snippet: string | null;
  receivedAt: string;
  aiResponse: string | null;
  semanticScore: number;
  keywordScore: number;
  finalScore: number;
  matchSource: 'semantic' | 'keyword' | 'both';
};

export type AttendeeSearchResults = {
  attendeeEmail: string;
  attendeeName: string | null;
  queries: string[];
  emails: ScoredEmail[];
};

export type MeetingSearchResults = {
  meeting: Meeting;
  attendeeResults: AttendeeSearchResults[];
};

// ---------------------------------------------------------------------------
// Step 5: Deduplicated results
// ---------------------------------------------------------------------------

export type DeduplicatedEmail = ScoredEmail & {
  relevantToAttendees: string[]; // list of attendee emails this is relevant to
};

export type AttendeeBundledEmails = {
  attendeeEmail: string;
  attendeeName: string | null;
  emails: DeduplicatedEmail[];
};

export type MeetingEmailBundles = {
  meeting: Meeting;
  attendeeBundles: AttendeeBundledEmails[];
  allEmails: DeduplicatedEmail[]; // flat list, deduplicated
  totalRetrieved: number;
};

// ---------------------------------------------------------------------------
// Step 6: Synthesis (final output)
// ---------------------------------------------------------------------------

export type AttendeeNote = {
  email: string;
  name: string | null;
  note: string;
  emailCount: number;
  responseStatus: string;
};

export type PrepResult = {
  meetingId: string;
  meetingSummary: string;
  briefing: string;
  talkingPoints: string[];
  openItems: string[];
  riskFlags: string[];
  suggestedApproach: string;
  attendeeNotes: AttendeeNote[];
  emailsUsed: number;
  generatedAt: string;
};

// ---------------------------------------------------------------------------
// Pipeline result (returned to UI)
// ---------------------------------------------------------------------------

export type MeetingPrepOutput = {
  meeting: Meeting;
  prep: PrepResult;
  fromCache: boolean;
  relatedEmails: DeduplicatedEmail[]; // 
};

export type PipelineResult = {
  success: boolean;
  events: MeetingPrepOutput[];
  errors: { meetingId: string; meetingSummary: string; error: string }[];
};

// ---------------------------------------------------------------------------
// Error wrapper — never throw, always return
// ---------------------------------------------------------------------------

export type StepResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

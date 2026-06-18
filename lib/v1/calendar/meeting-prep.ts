// lib/v1/calendar/meeting-prep.ts
// Meeting prep pipeline: stats + hybrid RAG search + LLM synthesis + DB cache.
// Uses prep-search.ts for hybrid vector+fulltext+RRF search.
// Does NOT touch the chat RAG pipeline.

import { sql } from 'drizzle-orm';
import { db } from '@/db';
import openRouterClient from '@/config/openrouter/config';
import { PrepSearchResult, searchRelevantEmails } from './prep-search';

const MODEL = 'inception/mercury-2';
const CACHE_TTL_HOURS = 6;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AttendeeContext = {
  email: string; name: string | null; responseStatus: string;
  emailsReceived: number; emailsSent: number; lastInteraction: string | null;
  relationshipType: string | null; sentiment: string | null;
  recentTopics: string[]; pendingItems: string[];
  relevantEmails: PrepSearchResult[];
};

export type AiPrep = {
  briefing: string; talkingPoints: string[]; openItems: string[];
  attendeeNotes: Record<string, string>; suggestedApproach: string; riskFlags: string[];
};

export type PreparedEvent = {
  id: string; summary: string; startTime: string; endTime: string;
  hangoutLink: string | null; htmlLink: string | null;
  location: string | null; description: string | null; isAllDay: boolean;
  attendeesRaw: { email: string; displayName: string | null; responseStatus: string; self: boolean }[];
  attendeePrep: AttendeeContext[]; prepSummary: string; aiPrep: AiPrep | null;
};

type EventInput = {
  id: string; summary: string; startTime: string; endTime: string;
  hangoutLink: string | null; htmlLink: string | null; location: string | null;
  description: string | null; isAllDay: boolean;
  attendees: { email: string; displayName: string | null; responseStatus: string; self: boolean }[];
};

// ---------------------------------------------------------------------------
// Main: check cache → generate if missing → save to cache
// ---------------------------------------------------------------------------

export async function enrichEventsWithPrep(events: EventInput[], tenantId = 'default'): Promise<PreparedEvent[]> {
  if (events.length === 0) return [];

  const eventIds = events.map((e) => e.id);
  const cached = await getCachedPreps(eventIds, tenantId);

  const results: PreparedEvent[] = [];
  const toGenerate: EventInput[] = [];

  for (const event of events) {
    const hit = cached.get(event.id);
    if (hit) { results.push(hit); } else { toGenerate.push(event); }
  }

  if (toGenerate.length > 0) {
    const generated = await generatePreps(toGenerate, tenantId);
    results.push(...generated);
    saveToCacheBatch(generated, tenantId).catch((err) => console.warn('[prep] cache save failed:', err instanceof Error ? err.message : err));
  }

  // Preserve original order
  const order = new Map(events.map((e, i) => [e.id, i]));
  results.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  return results;
}

// ---------------------------------------------------------------------------
// Cache read/write
// ---------------------------------------------------------------------------

async function getCachedPreps(eventIds: string[], tenantId: string): Promise<Map<string, PreparedEvent>> {
  const map = new Map<string, PreparedEvent>();
  if (eventIds.length === 0) return map;
  try {
    const idList = sql.join(eventIds.map((id) => sql`${id}`), sql`, `);
    const result = await db.execute(sql`
      SELECT event_id, prep_data FROM meeting_prep_cache
      WHERE tenant_id = ${tenantId}
        AND event_id IN (${idList}) AND created_at > NOW() - INTERVAL '6 hours'
    `);
    for (const row of result.rows) {
      const r = row as Record<string, unknown>;
      const data = r.prep_data as PreparedEvent;
      if (data?.id) map.set(String(r.event_id), data);
    }
  } catch (err) { console.warn('[prep] cache read failed:', err instanceof Error ? err.message : err); }
  return map;
}

async function saveToCacheBatch(events: PreparedEvent[], tenantId: string): Promise<void> {
  for (const event of events) {
    try {
      await db.execute(sql`
        INSERT INTO meeting_prep_cache (tenant_id, event_id, event_summary, event_start, prep_data)
        VALUES (${tenantId}, ${event.id}, ${event.summary}, ${event.startTime}::timestamptz, ${JSON.stringify(event)}::jsonb)
        ON CONFLICT (tenant_id, event_id) DO UPDATE SET prep_data = EXCLUDED.prep_data, created_at = NOW()
      `);
    } catch (err) { console.warn(`[prep] cache write failed for ${event.id}:`, err instanceof Error ? err.message : err); }
  }
}

// ---------------------------------------------------------------------------
// Generate pipeline: stats + hybrid search + LLM
// ---------------------------------------------------------------------------

async function generatePreps(events: EventInput[], tenantId: string): Promise<PreparedEvent[]> {
  const allEmails = new Set<string>();
  for (const ev of events) { for (const a of ev.attendees) { if (!a.self) allEmails.add(a.email.toLowerCase()); } }

  if (allEmails.size === 0) {
    return events.map((e) => ({ ...e, attendeesRaw: e.attendees, attendeePrep: [], prepSummary: 'No external attendees', aiPrep: null }));
  }

  const emailList = Array.from(allEmails);

  // Stats (parallel)
  const [receivedMap, sentMap] = await Promise.all([
    fetchReceivedStats(emailList, tenantId),
    fetchSentStats(emailList, tenantId),
  ]);

  // Enrich each event (parallel — hybrid search per event)
  const enriched = await Promise.all(events.map(async (event) => {
    const external = event.attendees.filter((a) => !a.self);
    const attendeeEmails = external.map((a) => a.email.toLowerCase());

    // Hybrid search: vector + fulltext + RRF merge
    const meetingContext = [event.summary, event.description ?? ''].filter(Boolean).join(' — ');
    let relevantMap = new Map<string, PrepSearchResult[]>();
    try {
      relevantMap = await searchRelevantEmails(meetingContext, attendeeEmails, tenantId);
    } catch (err) {
      console.warn(`[prep] search failed for "${event.summary}":`, err instanceof Error ? err.message : err);
    }

    const attendeePrep: AttendeeContext[] = external.map((a) => {
      const key = a.email.toLowerCase();
      const recv = receivedMap.get(key);
      return {
        email: a.email, name: a.displayName, responseStatus: a.responseStatus,
        emailsReceived: recv?.cnt ?? 0, emailsSent: sentMap.get(key) ?? 0,
        lastInteraction: recv?.last_at ?? null, relationshipType: recv?.rel_type ?? null,
        sentiment: recv?.sentiment ?? null, recentTopics: (recv?.topics ?? []).slice(0, 5),
        pendingItems: (recv?.tasks ?? []).slice(0, 5),
        relevantEmails: relevantMap.get(key) ?? [],
      };
    });

    const known = attendeePrep.filter((a) => a.emailsReceived > 0 || a.emailsSent > 0).length;
    const pending = attendeePrep.reduce((s, a) => s + a.pendingItems.length, 0);
    const parts: string[] = [];
    if (known > 0) parts.push(`${known} known`);
    if (pending > 0) parts.push(`${pending} pending`);
    if (known === 0 && external.length > 0) parts.push('New contacts');

    return { ...event, attendeesRaw: event.attendees, attendeePrep, prepSummary: parts.join(' · ') || 'No context', aiPrep: null as AiPrep | null };
  }));

  // LLM synthesis (parallel)
  await Promise.all(enriched.map(async (event) => {
    if (event.attendeePrep.length === 0) return;
    try { event.aiPrep = await generateAiPrep(event); }
    catch (err) { console.warn(`[prep] AI failed for ${event.id}:`, err instanceof Error ? err.message : err); }
  }));

  return enriched;
}

// ---------------------------------------------------------------------------
// LLM: generate AI prep brief
// ---------------------------------------------------------------------------

async function generateAiPrep(event: { summary: string; startTime: string; endTime: string; description: string | null; attendeePrep: AttendeeContext[] }): Promise<AiPrep> {
  const blocks = event.attendeePrep.map((a) => {
    const name = a.name ?? a.email.split('@')[0];
    const has = a.emailsReceived > 0 || a.emailsSent > 0;
    if (!has) return `- ${name} (${a.email}): No prior history. RSVP: ${a.responseStatus}`;

    const emailSection = a.relevantEmails.length > 0
      ? `  Relevant emails (hybrid search — higher score = better match):\n${a.relevantEmails.map((e) => `    [score:${e.rrfScore.toFixed(4)} ${e.matchSources.join('+')}] "${e.subject}" — ${e.snippet}`).join('\n')}`
      : '  No relevant emails found for this meeting topic';

    return [
      `- ${name} (${a.email}):`,
      `  Relationship: ${a.relationshipType ?? 'unknown'} | Sentiment: ${a.sentiment ?? 'unknown'}`,
      `  Emails: ${a.emailsReceived} received, ${a.emailsSent} sent | Last: ${a.lastInteraction ?? 'unknown'}`,
      `  RSVP: ${a.responseStatus}`,
      a.recentTopics.length > 0 ? `  Topics: ${a.recentTopics.join(', ')}` : '',
      a.pendingItems.length > 0 ? `  Pending: ${a.pendingItems.join('; ')}` : '',
      emailSection,
    ].filter(Boolean).join('\n');
  }).join('\n\n');

  const prompt = `You are an AI meeting prep assistant. Generate a structured meeting prep brief.

MEETING:
Title: ${event.summary}
Time: ${event.startTime} to ${event.endTime}
${event.description ? `Description: ${event.description}` : ''}

ATTENDEES (with email context from hybrid search — emails matched by BOTH keyword AND semantic similarity are most relevant):
${blocks}

Generate a JSON object with exactly these fields:
{
  "briefing": "1-2 sentence overview based on the email context",
  "talkingPoints": ["3-5 SPECIFIC points derived from the relevant emails — reference actual content, not generic advice"],
  "openItems": ["Unresolved action items from the pending items and emails"],
  "attendeeNotes": {"email@example.com": "1 sentence about your relationship and what to know"},
  "suggestedApproach": "1 sentence on how to approach this meeting based on sentiment and context",
  "riskFlags": ["Any concerns. Empty array if none."]
}

CRITICAL: Use the RELEVANT EMAIL content for specific points. If an email says "Q2 revenue dropped 12%", reference that specifically. Do NOT write generic talking points like "discuss Q2 performance".

Respond with ONLY the JSON object. No markdown fences, no extra text before or after.`;

  const response = await openRouterClient.chat.completions.create({
    model: MODEL, temperature: 0.3, max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = response.choices[0]?.message?.content?.trim() ?? '';
  return parseAiPrepJson(raw);
}

// Robust JSON extraction — handles LLM wrapping output in markdown, extra text, etc.
function parseAiPrepJson(raw: string): AiPrep {
  const empty: AiPrep = { briefing: '', talkingPoints: [], openItems: [], attendeeNotes: {}, suggestedApproach: '', riskFlags: [] };

  // Strip markdown fences
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

  // Extract JSON object — find first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    console.warn('[prep] AI response has no JSON object');
    return { ...empty, briefing: cleaned.slice(0, 200) };
  }
  cleaned = cleaned.slice(firstBrace, lastBrace + 1);

  try {
    const p = JSON.parse(cleaned);
    return {
      briefing: String(p.briefing ?? ''),
      talkingPoints: Array.isArray(p.talkingPoints) ? p.talkingPoints.map(String) : [],
      openItems: Array.isArray(p.openItems) ? p.openItems.map(String) : [],
      attendeeNotes: typeof p.attendeeNotes === 'object' && p.attendeeNotes !== null ? p.attendeeNotes : {},
      suggestedApproach: String(p.suggestedApproach ?? ''),
      riskFlags: Array.isArray(p.riskFlags) ? p.riskFlags.map(String) : [],
    };
  } catch {
    console.warn('[prep] JSON parse failed, raw:', cleaned.slice(0, 100));
    return { ...empty, briefing: cleaned.slice(0, 200) };
  }
}

// ---------------------------------------------------------------------------
// Stats: received emails
// ---------------------------------------------------------------------------

type ReceivedStats = { cnt: number; last_at: string | null; rel_type: string | null; sentiment: string | null; topics: string[]; tasks: string[] };

async function fetchReceivedStats(emails: string[], tenantId: string): Promise<Map<string, ReceivedStats>> {
  const map = new Map<string, ReceivedStats>();
  if (emails.length === 0) return map;
  const emailList = sql.join(emails.map((e) => sql`${e}`), sql`, `);

  const result = await db.execute(sql`
    SELECT
      LOWER(from_email) AS email,
      COUNT(*)::int AS cnt,
      MAX(received_at)::text AS last_at,
      MODE() WITHIN GROUP (ORDER BY ai_analysis->>'relationship_type') AS rel_type,
      MODE() WITHIN GROUP (ORDER BY ai_analysis->>'sentiment') AS sentiment,
      ARRAY_AGG(DISTINCT topic) FILTER (WHERE topic IS NOT NULL) AS topics,
      ARRAY_AGG(DISTINCT task_text) FILTER (WHERE task_text IS NOT NULL) AS tasks
    FROM emails
    LEFT JOIN LATERAL (
      SELECT jsonb_array_elements_text(ai_analysis->'topics') AS topic
    ) t ON true
    LEFT JOIN LATERAL (
      SELECT COALESCE(
        item->>'task',
        item #>> '{}'
      ) AS task_text
      FROM jsonb_array_elements(ai_analysis->'action_items') AS item
    ) a ON true
    WHERE tenant_id = ${tenantId}
      AND LOWER(from_email) IN (${emailList}) AND ai_analysis IS NOT NULL
    GROUP BY LOWER(from_email)
  `);

  for (const row of result.rows) {
    const r = row as Record<string, unknown>;
    map.set(String(r.email), {
      cnt: Number(r.cnt), last_at: r.last_at as string | null,
      rel_type: r.rel_type as string | null, sentiment: r.sentiment as string | null,
      topics: (r.topics as string[]) ?? [], tasks: (r.tasks as string[]) ?? [],
    });
  }
  return map;
}

// ---------------------------------------------------------------------------
// Stats: sent emails
// ---------------------------------------------------------------------------

async function fetchSentStats(emails: string[], tenantId: string): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (emails.length === 0) return map;
  const emailList = sql.join(emails.map((e) => sql`${e}`), sql`, `);

  const result = await db.execute(sql`
    SELECT LOWER(addr) AS email, COUNT(DISTINCT emails.id)::int AS cnt
    FROM emails,
      LATERAL jsonb_array_elements_text(to_emails) AS addr
    WHERE tenant_id = ${tenantId}
      AND LOWER(addr) IN (${emailList}) AND is_sent = true
    GROUP BY LOWER(addr)
  `);

  for (const row of result.rows) {
    const r = row as Record<string, unknown>;
    map.set(String(r.email), Number(r.cnt));
  }
  return map;
}
// lib/v1/meeting-prep/step4-hybrid-search.ts
//
// Step 4: Hybrid search — semantic (vector) + keyword (tsvector)
//
// Scoring formula:
//   - Both sources match:  finalScore = (0.7 × semantic) + (0.3 × keyword)
//   - Only one matches:    finalScore = that source's score (no penalty)
//
// Why: The weighted blend rewards dual-match emails naturally (they score higher
// because both terms contribute positively). But when only semantic OR only keyword
// finds an email, we don't penalize it — we trust that source's score as-is.
// A semantic-only score of 0.68 means "68% relevant by meaning" — multiplying
// by 0.7 just because keyword didn't match would distort that signal.
//
// PREREQUISITE: search_vector column must be populated. Run once:
//
//   UPDATE emails
//   SET search_vector = to_tsvector('english', COALESCE(subject,'') || ' ' || COALESCE(body_text,''))
//   WHERE search_vector IS NULL;
//
//   CREATE OR REPLACE FUNCTION emails_search_vector_trigger() RETURNS trigger AS $$
//   BEGIN
//     NEW.search_vector := to_tsvector('english', COALESCE(NEW.subject,'') || ' ' || COALESCE(NEW.body_text,''));
//     RETURN NEW;
//   END;
//   $$ LANGUAGE plpgsql;
//
//   DROP TRIGGER IF EXISTS trg_emails_search_vector ON emails;
//   CREATE TRIGGER trg_emails_search_vector
//     BEFORE INSERT OR UPDATE ON emails
//     FOR EACH ROW EXECUTE FUNCTION emails_search_vector_trigger();


import { sql } from 'drizzle-orm';
import type { MeetingQueries, MeetingSearchResults, AttendeeSearchResults, ScoredEmail, StepResult } from './types';
import { getEmbedding } from './llm';
import { db } from '@/db';

const SCORE_THRESHOLD = 0.5;
const SEMANTIC_WEIGHT = 0.7;
const KEYWORD_WEIGHT = 0.3;
const MAX_RESULTS_PER_QUERY = 10;

// ---------------------------------------------------------------------------
// Debug types
// ---------------------------------------------------------------------------

export type SearchDebugEntry = {
  query: string;
  semanticResults: { emailId: string; subject: string | null; score: number }[];
  keywordResults: { emailId: string; subject: string | null; score: number }[];
  combinedResults: { emailId: string; subject: string | null; semanticScore: number; keywordScore: number; finalScore: number; matchSource: string; passedThreshold: boolean }[];
};

export type AttendeeSearchDebug = {
  attendeeEmail: string;
  queries: SearchDebugEntry[];
  finalEmailCount: number;
};

export type MeetingSearchDebug = {
  meetingId: string;
  attendeeDebug: AttendeeSearchDebug[];
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function hybridSearch(meetingQueries: MeetingQueries[]): Promise<StepResult<{ results: MeetingSearchResults[]; debug: MeetingSearchDebug[] }>> {
  try {
    const results: MeetingSearchResults[] = [];
    const debug: MeetingSearchDebug[] = [];

    for (const mq of meetingQueries) {
      const { attendeeResults, attendeeDebug } = await searchForMeeting(mq);
      results.push({ meeting: mq.meeting, attendeeResults });
      debug.push({ meetingId: mq.meeting.id, attendeeDebug });
    }

    return { ok: true, data: { results, debug } };
  } catch (err) {
    return { ok: false, error: `Step 4 failed: ${err instanceof Error ? err.message : 'Unknown'}` };
  }
}

// ---------------------------------------------------------------------------
// Sub-step 4a: Search for all attendees of a single meeting
// ---------------------------------------------------------------------------

async function searchForMeeting(mq: MeetingQueries): Promise<{ attendeeResults: AttendeeSearchResults[]; attendeeDebug: AttendeeSearchDebug[] }> {
  const attendeeResults: AttendeeSearchResults[] = [];
  const attendeeDebug: AttendeeSearchDebug[] = [];

  for (const aq of mq.attendeeQueries) {
    const { emails, queryDebug } = await searchForAttendee(aq.queries);
    attendeeResults.push({
      attendeeEmail: aq.attendeeEmail,
      attendeeName: aq.attendeeName,
      queries: aq.queries,
      emails,
    });
    attendeeDebug.push({
      attendeeEmail: aq.attendeeEmail,
      queries: queryDebug,
      finalEmailCount: emails.length,
    });
  }

  return { attendeeResults, attendeeDebug };
}

// ---------------------------------------------------------------------------
// Sub-step 4b: Run all queries for a single attendee, merge results
// ---------------------------------------------------------------------------

async function searchForAttendee(queries: string[]): Promise<{ emails: ScoredEmail[]; queryDebug: SearchDebugEntry[] }> {
  const allResults = new Map<string, ScoredEmail>();
  const queryDebug: SearchDebugEntry[] = [];

  for (const query of queries) {
    const { scored, debug } = await runHybridSearchForQuery(query);
    queryDebug.push(debug);

    for (const result of scored) {
      const existing = allResults.get(result.id);
      if (!existing || result.finalScore > existing.finalScore) {
        allResults.set(result.id, result);
      }
    }
  }

  const emails = Array.from(allResults.values()).sort((a, b) => b.finalScore - a.finalScore);
  return { emails, queryDebug };
}

// ---------------------------------------------------------------------------
// Sub-step 4c: Run hybrid search for a single query + combine scores
// ---------------------------------------------------------------------------

async function runHybridSearchForQuery(query: string): Promise<{ scored: ScoredEmail[]; debug: SearchDebugEntry }> {
  const [semanticRaw, keywordRaw] = await Promise.all([
    runSemanticSearch(query),
    runKeywordSearch(query),
  ]);

  const debugSemantic = semanticRaw.map((r) => ({ emailId: r.id, subject: r.subject, score: round(r.score) }));
  const debugKeyword = keywordRaw.map((r) => ({ emailId: r.id, subject: r.subject, score: round(r.score) }));

  // Build combined map
  const emailMap = new Map<string, { semantic: number; keyword: number; data: any }>();

  for (const row of semanticRaw) {
    emailMap.set(row.id, { semantic: row.score, keyword: 0, data: row });
  }

  for (const row of keywordRaw) {
    const existing = emailMap.get(row.id);
    if (existing) {
      existing.keyword = row.score;
    } else {
      emailMap.set(row.id, { semantic: 0, keyword: row.score, data: row });
    }
  }

  const scored: ScoredEmail[] = [];
  const debugCombined: SearchDebugEntry['combinedResults'] = [];

  for (const [id, entry] of emailMap) {
    const hasSemantic = entry.semantic > 0;
    const hasKeyword = entry.keyword > 0;

    // ── Scoring formula ──
    // Both matched:     weighted blend (semantic-heavy)
    // Only one matched: use that score directly, no penalty
    let finalScore: number;
    let matchSource: ScoredEmail['matchSource'];

    if (hasSemantic && hasKeyword) {
      finalScore = (SEMANTIC_WEIGHT * entry.semantic) + (KEYWORD_WEIGHT * entry.keyword);
      matchSource = 'both';
    } else if (hasSemantic) {
      finalScore = entry.semantic;
      matchSource = 'semantic';
    } else {
      finalScore = entry.keyword;
      matchSource = 'keyword';
    }

    const passedThreshold = finalScore >= SCORE_THRESHOLD;

    debugCombined.push({
      emailId: id,
      subject: entry.data.subject ?? null,
      semanticScore: round(entry.semantic),
      keywordScore: round(entry.keyword),
      finalScore: round(finalScore),
      matchSource,
      passedThreshold,
    });

    if (!passedThreshold) continue;

    scored.push({
      id,
      threadId: entry.data.thread_id ?? '',
      fromEmail: entry.data.from_email ?? '',
      fromName: entry.data.from_name ?? null,
      subject: entry.data.subject ?? null,
      bodyText: entry.data.body_text ?? null,
      snippet: entry.data.snippet ?? null,
      receivedAt: entry.data.received_at ?? '',
      aiResponse: entry.data.ai_analysis
        ? (typeof entry.data.ai_analysis === 'string' ? entry.data.ai_analysis : JSON.stringify(entry.data.ai_analysis))
        : null,
      semanticScore: round(entry.semantic),
      keywordScore: round(entry.keyword),
      finalScore: round(finalScore),
      matchSource,
    });
  }

  return {
    scored: scored.sort((a, b) => b.finalScore - a.finalScore),
    debug: {
      query,
      semanticResults: debugSemantic,
      keywordResults: debugKeyword,
      combinedResults: debugCombined.sort((a, b) => b.finalScore - a.finalScore),
    },
  };
}

// ---------------------------------------------------------------------------
// Sub-step 4d: Semantic (vector) search
// ---------------------------------------------------------------------------

type RawSearchRow = {
  id: string; thread_id: string; from_email: string; from_name: string | null;
  subject: string | null; body_text: string | null; snippet: string | null;
  received_at: string; ai_analysis: any; score: number;
};

async function runSemanticSearch(query: string): Promise<RawSearchRow[]> {
  const embeddingResult = await getEmbedding(query);

  if (!embeddingResult.ok) {
    console.error(`[Step 4d] Embedding failed: ${embeddingResult.error}`);
    return [];
  }

  const vector = embeddingResult.data;
  const vectorLiteral = sql.raw(`'[${vector.join(',')}]'::vector`);

  try {
    const rows = await db.execute(sql`
      SELECT
        id, thread_id, from_email, from_name, subject,
        body_text, snippet, received_at, ai_analysis,
        1 - (embedding <=> ${vectorLiteral}) as score
      FROM emails
      WHERE embedding IS NOT NULL
        AND 1 - (embedding <=> ${vectorLiteral}) >= 0.55
      ORDER BY embedding <=> ${vectorLiteral}
      LIMIT ${MAX_RESULTS_PER_QUERY}
    `);

    return rows.rows.map((r: any) => ({
      id: r.id,
      thread_id: r.thread_id,
      from_email: r.from_email,
      from_name: r.from_name,
      subject: r.subject,
      body_text: r.body_text,
      snippet: r.snippet,
      received_at: r.received_at,
      ai_analysis: r.ai_analysis,
      score: Math.max(0, Number(r.score) || 0),
    }));
  } catch (err) {
    console.error(`[Step 4d] Semantic search error:`, err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Sub-step 4e: Keyword (tsvector) search — uses pre-computed search_vector
// ---------------------------------------------------------------------------

async function runKeywordSearch(query: string): Promise<RawSearchRow[]> {
  if (!query.trim()) return [];

  try {
    const rows = await db.execute(sql`
      SELECT
        id, thread_id, from_email, from_name, subject,
        body_text, snippet, received_at, ai_analysis,
        ts_rank_cd(search_vector, to_tsquery('english', ${buildOrQuery(query)})) as score
FROM emails
WHERE search_vector IS NOT NULL
  AND search_vector @@ to_tsquery('english', ${buildOrQuery(query)})
      ORDER BY score DESC
      LIMIT ${MAX_RESULTS_PER_QUERY}
    `);

    const rawRows = rows.rows.map((r: any) => ({
      id: r.id,
      thread_id: r.thread_id,
      from_email: r.from_email,
      from_name: r.from_name,
      subject: r.subject,
      body_text: r.body_text,
      snippet: r.snippet,
      received_at: r.received_at,
      ai_analysis: r.ai_analysis,
      score: Number(r.score) || 0,
    }));

    // Normalize keyword scores to 0-1 range
    const maxScore = Math.max(...rawRows.map((r) => r.score), 0.001);
    return rawRows.map((r) => ({ ...r, score: r.score / maxScore }));
  } catch (err) {
    console.error(`[Step 4e] Keyword search error:`, err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Util
// ---------------------------------------------------------------------------

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function buildOrQuery(query: string): string {
  return query
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 2)
    .join(' | ');
}
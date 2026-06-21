// lib/v1/calendar/prep-search.ts
// Hybrid search for meeting prep: vector similarity + full-text search + RRF merge.
// Filtered by attendee emails. Completely standalone — does not touch the chat RAG pipeline.

import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { generateEmbedding } from '@/lib/v1/ai-chat/embeddings/generate';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PrepSearchResult = {
  id: string;
  fromEmail: string;
  subject: string;
  receivedAt: string;
  snippet: string;
  topics: string | null;
  similarity: number;       // 0-1 from vector search (0 if only fulltext matched)
  matchSources: ('vector' | 'fulltext')[];
  rrfScore: number;
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const RRF_K = 60;
const MIN_RRF_SCORE = 0.008;
const VECTOR_LIMIT = 15;
const FULLTEXT_LIMIT = 15;
const PER_ATTENDEE_LIMIT = 5;

// ---------------------------------------------------------------------------
// Main: hybrid search for meeting prep
// ---------------------------------------------------------------------------

export async function searchRelevantEmails(
  meetingContext: string, attendeeEmails: string[], tenantId = 'default',
): Promise<Map<string, PrepSearchResult[]>> {
  if (!meetingContext.trim() || attendeeEmails.length === 0) {
    return new Map();
  }

  const emailList = sql.join(attendeeEmails.map((e) => sql`${e}`), sql`, `);

  // Run vector + fulltext in parallel
  const [vectorResults, fulltextResults] = await Promise.allSettled([
    vectorSearch(meetingContext, emailList, VECTOR_LIMIT, tenantId),
    fulltextSearch(meetingContext, emailList, FULLTEXT_LIMIT, tenantId),
  ]);

  const vector = vectorResults.status === 'fulfilled' ? vectorResults.value : [];
  const fulltext = fulltextResults.status === 'fulfilled' ? fulltextResults.value : [];

  console.log(`[prep-search] vector=${vector.length} fulltext=${fulltext.length} for "${meetingContext.slice(0, 50)}"`);

  // RRF merge
  const merged = rrfMerge(vector, fulltext);

  // Filter by minimum score
  const filtered = merged.filter((r) => r.rrfScore >= MIN_RRF_SCORE);

  // Group by attendee, top N per person
  return groupByAttendee(filtered, PER_ATTENDEE_LIMIT);
}

// ---------------------------------------------------------------------------
// Layer 1: Vector similarity search (semantic)
// ---------------------------------------------------------------------------

type RawResult = {
  id: string;
  from_email: string;
  subject: string;
  receivedAt: string;
  snippet: string;
  topics: string | null;
  similarity: number;
};

async function vectorSearch(
  query: string,
  emailFilter: ReturnType<typeof sql.join>,
  limit: number,
  tenantId: string,
): Promise<RawResult[]> {
  const embedding = await generateEmbedding(query, tenantId);
  if (!embedding || embedding.length === 0) return [];

  const embeddingStr = `[${embedding.join(',')}]`;

  const result = await db.execute(sql`
    SELECT
      id,
      LOWER(from_email) AS from_email,
      subject,
      received_at AS "receivedAt",
      LEFT(COALESCE(body_text, ''), 200) AS snippet,
      ai_analysis->>'topics' AS topics,
      (1 - (embedding <=> ${embeddingStr}::vector)) AS similarity
    FROM emails
    WHERE tenant_id = ${tenantId}
      AND LOWER(from_email) IN (${emailFilter})
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `);

  return (result.rows as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    from_email: String(r.from_email),
    subject: String(r.subject ?? '(no subject)'),
    receivedAt: String(r.receivedAt ?? ''),
    snippet: String(r.snippet ?? ''),
    topics: r.topics as string | null,
    similarity: Number(r.similarity ?? 0),
  }));
}

// ---------------------------------------------------------------------------
// Layer 2: Full-text search (keyword matching via tsvector)
// ---------------------------------------------------------------------------

async function fulltextSearch(
  query: string,
  emailFilter: ReturnType<typeof sql.join>,
  limit: number,
  tenantId: string,
): Promise<RawResult[]> {
  const searchTerms = query
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 8)
    .join(' & ');

  if (!searchTerms) return [];

  const result = await db.execute(sql`
    SELECT
      id,
      LOWER(from_email) AS from_email,
      subject,
      received_at AS "receivedAt",
      LEFT(COALESCE(body_text, ''), 200) AS snippet,
      ai_analysis->>'topics' AS topics,
      ts_rank(search_vector, to_tsquery('english', ${searchTerms})) AS rank
    FROM emails
    WHERE tenant_id = ${tenantId}
      AND LOWER(from_email) IN (${emailFilter})
      AND search_vector IS NOT NULL
      AND search_vector @@ to_tsquery('english', ${searchTerms})
    ORDER BY rank DESC
    LIMIT ${limit}
  `);

  return (result.rows as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    from_email: String(r.from_email),
    subject: String(r.subject ?? '(no subject)'),
    receivedAt: String(r.receivedAt ?? ''),
    snippet: String(r.snippet ?? ''),
    topics: r.topics as string | null,
    similarity: 0,
  }));
}

// ---------------------------------------------------------------------------
// RRF Merge (Reciprocal Rank Fusion)
// ---------------------------------------------------------------------------

function rrfMerge(vectorResults: RawResult[], fulltextResults: RawResult[]): PrepSearchResult[] {
  const merged = new Map<string, PrepSearchResult>();

  for (let rank = 0; rank < vectorResults.length; rank++) {
    const r = vectorResults[rank];
    const rrfScore = 1 / (rank + RRF_K);

    merged.set(r.id, {
      id: r.id,
      fromEmail: r.from_email,
      subject: r.subject,
      receivedAt: r.receivedAt,
      snippet: r.snippet,
      topics: r.topics,
      similarity: r.similarity,
      matchSources: ['vector'],
      rrfScore,
    });
  }

  for (let rank = 0; rank < fulltextResults.length; rank++) {
    const r = fulltextResults[rank];
    const rrfScore = 1 / (rank + RRF_K);

    const existing = merged.get(r.id);
    if (existing) {
      existing.rrfScore += rrfScore;
      if (!existing.matchSources.includes('fulltext')) {
        existing.matchSources.push('fulltext');
      }
    } else {
      merged.set(r.id, {
        id: r.id,
        fromEmail: r.from_email,
        subject: r.subject,
        receivedAt: r.receivedAt,
        snippet: r.snippet,
        topics: r.topics,
        similarity: r.similarity,
        matchSources: ['fulltext'],
        rrfScore,
      });
    }
  }

  return Array.from(merged.values()).sort((a, b) => {
    if (a.matchSources.length !== b.matchSources.length) {
      return b.matchSources.length - a.matchSources.length;
    }
    return b.rrfScore - a.rrfScore;
  });
}

// ---------------------------------------------------------------------------
// Group by attendee
// ---------------------------------------------------------------------------

function groupByAttendee(results: PrepSearchResult[], perPerson: number): Map<string, PrepSearchResult[]> {
  const map = new Map<string, PrepSearchResult[]>();
  for (const r of results) {
    const key = r.fromEmail.toLowerCase();
    if (!map.has(key)) map.set(key, []);
    const list = map.get(key)!;
    if (list.length < perPerson) list.push(r);
  }
  return map;
}
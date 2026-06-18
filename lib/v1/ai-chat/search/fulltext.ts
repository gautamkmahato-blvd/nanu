// lib/v1/ai-chat/search/fulltext.ts
// Layer 2: Postgres full-text search on subject + body + summary.

import { sql } from 'drizzle-orm';
import { db } from '@/db';
import type { SearchResultEmail } from '../types';

/**
 * Full-text search using Postgres tsvector.
 * Matches keywords from the search terms against the pre-built search_vector.
 * Returns results ranked by relevance.
 */
export async function fulltextSearch(
  searchTerms: string,
  limit = 10,
  tenantId = 'default',
): Promise<SearchResultEmail[]> {
  const cleaned = searchTerms.trim().replace(/[^\w\s]/g, ' ').trim();
  if (!cleaned) return [];

  const result = await db.execute(sql`
    SELECT
      id,
      thread_id,
      subject,
      from_email,
      from_name,
      snippet,
      received_at,
      ai_analysis->>'summary' AS summary,
      ts_rank(search_vector, to_tsquery('english', ${buildOrQuery(cleaned)})) AS rank
    FROM emails
    WHERE tenant_id = ${tenantId}
      AND is_sent = false
      AND search_vector @@ to_tsquery('english', ${buildOrQuery(cleaned)})
    ORDER BY rank DESC
    LIMIT ${limit}
  `);

  return (result.rows as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    thread_id: String(row.thread_id),
    subject: (row.subject as string) ?? null,
    from_email: String(row.from_email),
    from_name: (row.from_name as string) ?? null,
    snippet: (row.snippet as string) ?? null,
    received_at: new Date(row.received_at as string).toISOString(),
    summary: (row.summary as string) ?? null,
    relevance_score: Number(row.rank) || 0,
    match_sources: ['fulltext' as const],
  }));
}

function buildOrQuery(query: string): string {
  const words = query.trim().split(/\s+/).filter((w) => w.length >= 2);
  if (words.length === 0) return '';
  return words.join(' | ');
}
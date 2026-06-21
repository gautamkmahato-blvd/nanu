// lib/v1/ai-chat/embeddings/search.ts
// Layer 3: Semantic vector similarity search.

import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { generateEmbedding } from './generate';
import type { SearchResultEmail } from '../types';

/**
 * Semantic search: embed the query, find closest emails by cosine distance.
 * Returns up to `limit` results sorted by similarity.
 */
export async function semanticSearch(
  queryText: string,
  limit = 10,
  tenantId = 'default',
): Promise<SearchResultEmail[]> {
  if (!queryText.trim()) return [];

  // Embed the query
  const queryVector = await generateEmbedding(queryText, tenantId);
  const vectorStr = `[${queryVector.join(',')}]`;

  // Find closest emails
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
      1 - (embedding <=> ${vectorStr}::vector) AS similarity
    FROM emails
    WHERE tenant_id = ${tenantId}
      AND embedding IS NOT NULL
      AND is_sent = false
      AND 1 - (embedding <=> ${vectorStr}::vector) >= 0.5
    ORDER BY embedding <=> ${vectorStr}::vector
    LIMIT ${limit}
  `);

  return (result.rows as Record<string, unknown>[]).map((row, index) => ({
    id: String(row.id),
    thread_id: String(row.thread_id),
    subject: (row.subject as string) ?? null,
    from_email: String(row.from_email),
    from_name: (row.from_name as string) ?? null,
    snippet: (row.snippet as string) ?? null,
    received_at: new Date(row.received_at as string).toISOString(),
    summary: (row.summary as string) ?? null,
    relevance_score: Number(row.similarity) || 0,
    match_sources: ['semantic' as const],
  }));
}
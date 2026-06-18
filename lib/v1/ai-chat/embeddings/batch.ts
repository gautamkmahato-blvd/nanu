// lib/v1/ai-chat/embeddings/batch.ts
// Batch embeds all emails that don't have embeddings yet.
// Designed to run in background, similar to the classify pipeline.

import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { generateEmbeddingsBatch, buildEmbeddingText } from './generate';

const BATCH_SIZE = 50;
const MAX_BATCHES = 20; // 50 × 20 = 1000 emails per run

export type EmbedStats = {
  embedded: number;
  failed: number;
  remaining: number;
};

type UnembeddedEmail = {
  id: string;
  subject: string | null;
  body_text: string | null;
  ai_analysis: Record<string, unknown> | null;
};

function tenantClause(tenantId?: string) {
  return tenantId ? sql`AND tenant_id = ${tenantId}` : sql``;
}

let running = false;

export async function embedPendingEmails(tenantId?: string): Promise<EmbedStats> {
  const stats: EmbedStats = { embedded: 0, failed: 0, remaining: 0 };

  if (running) {
    stats.remaining = await countPending(tenantId);
    return stats;
  }

  const tClause = tenantClause(tenantId);

  running = true;
  try {
    for (let b = 0; b < MAX_BATCHES; b++) {
      // Fetch unembedded emails
      const result = await db.execute(sql`
        SELECT id, subject, body_text, ai_analysis
        FROM emails
        WHERE embedding IS NULL
          ${tClause}
        ORDER BY received_at DESC
        LIMIT ${BATCH_SIZE}
      `);

      const emails = result.rows as UnembeddedEmail[];
      if (emails.length === 0) break;

      // Build texts
      const texts = emails.map((e) => buildEmbeddingText(e));

      // Generate embeddings in one API call
      try {
        const vectors = await generateEmbeddingsBatch(texts);

        // Save each embedding
        for (let i = 0; i < emails.length; i++) {
          const email = emails[i];
          const vector = vectors[i];
          if (!vector) continue;

          try {
            const vectorStr = `[${vector.join(',')}]`;
            await db.execute(sql`
              UPDATE emails
              SET embedding = ${vectorStr}::vector
              WHERE id = ${email.id}
            `);
            stats.embedded++;
          } catch (err) {
            console.warn(`[embed] failed to save ${email.id}:`, err);
            stats.failed++;
          }
        }

        console.log(`[embed] batch ${b + 1}: embedded ${emails.length} emails`);
      } catch (err) {
        console.error(`[embed] batch ${b + 1} API call failed:`, err);
        stats.failed += emails.length;
        break; // API down, stop
      }
    }

    stats.remaining = await countPending(tenantId);

    if (stats.embedded > 0) {
      console.log(`[embed] done: ${stats.embedded} embedded, ${stats.failed} failed, ${stats.remaining} remaining`);
    }

    return stats;
  } finally {
    running = false;
  }
}

async function countPending(tenantId?: string): Promise<number> {
  const tClause = tenantClause(tenantId);

  const result = await db.execute(sql`
    SELECT COUNT(*)::int AS n FROM emails
    WHERE embedding IS NULL
      ${tClause}
  `);
  return Number((result.rows[0] as { n?: number })?.n ?? 0);
}
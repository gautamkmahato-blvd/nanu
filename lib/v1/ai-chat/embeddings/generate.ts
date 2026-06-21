// lib/v1/ai-chat/embeddings/generate.ts
// Generates embeddings via OpenRouter using Qwen3 embedding model.

import { getClientForTenant } from '@/config/openrouter/config';

const EMBEDDING_MODEL = 'qwen/qwen3-embedding-8b';
const EMBEDDING_DIM = 1024;

export { EMBEDDING_DIM };

/**
 * Generate embedding for a single text string.
 * Returns a float[] vector of dimension 1024.
 */
export async function generateEmbedding(text: string, tenantId: string): Promise<number[]> {
  if (!text.trim()) {
    return new Array(EMBEDDING_DIM).fill(0);
  }

  const client = await getClientForTenant(tenantId);
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000), // Qwen context limit safety
    encoding_format: 'float',
    dimensions: 1024,
  });

  const vector = response.data?.[0]?.embedding;
  if (!vector || vector.length !== EMBEDDING_DIM) {
    throw new Error(`Invalid embedding: expected ${EMBEDDING_DIM} dims, got ${vector?.length ?? 0}`);
  }

  return vector;
}

/**
 * Generate embeddings for multiple texts in one API call.
 * Returns array of float[] vectors in same order as input.
 */
export async function generateEmbeddingsBatch(texts: string[], tenantId: string): Promise<number[][]> {
  if (texts.length === 0) return [];

  const cleaned = texts.map((t) => t.slice(0, 8000) || ' ');

  const client = await getClientForTenant(tenantId);
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: cleaned,
    encoding_format: 'float',
    dimensions: 1024,
  });

  return response.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

/**
 * Build the text to embed for an email.
 * Combines subject + summary + body for maximum searchability.
 */
export function buildEmbeddingText(email: {
  subject: string | null;
  body_text: string | null;
  ai_analysis: Record<string, unknown> | null;
}): string {
  const parts = [
    email.subject ?? '',
    (email.ai_analysis?.summary as string) ?? '',
    (email.body_text ?? '').slice(0, 500),
  ];
  return parts.filter(Boolean).join(' ').trim();
}

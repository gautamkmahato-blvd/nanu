import { getClientForTenant } from '@/config/openrouter/config';
// lib/v1/meeting-prep/llm.ts
// Shared LLM and embedding helpers.
// Wraps OpenRouter API calls with error handling.

import type { StepResult } from './types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? '';

const CHAT_MODEL = process.env.MEETING_PREP_CHAT_MODEL ?? 'deepseek/deepseek-chat-v3-0324';
const EMBEDDING_MODEL = process.env.MEETING_PREP_EMBEDDING_MODEL ?? 'qwen/qwen3-embedding-8b';
const EMBEDDING_DIMENSIONS = 1024;

// ---------------------------------------------------------------------------
// LLM Chat Call
// ---------------------------------------------------------------------------

export async function callLLM(prompt: string, maxTokens: number = 2000, tenantId: string): Promise<StepResult<string>> {
  try {
    const client = await getClientForTenant(tenantId);
    const response = await client.chat.completions.create({
      model: CHAT_MODEL,
      max_tokens: maxTokens,
      temperature: 0.3, // low for factual accuracy
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return { ok: false, error: 'LLM returned empty response' };
    }

    return { ok: true, data: content };
  } catch (err) {
    return { ok: false, error: `LLM call error: ${err instanceof Error ? err.message : 'Unknown'}` };
  }
}

// ---------------------------------------------------------------------------
// Parse JSON from LLM response (handles markdown fences)
// ---------------------------------------------------------------------------

export function parseLLMJson<T>(raw: string): StepResult<T> {
  try {
    // Strip markdown code fences if present
    let cleaned = raw.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);
    return { ok: true, data: parsed as T };
  } catch (err) {
    return { ok: false, error: `Failed to parse LLM JSON: ${err instanceof Error ? err.message : 'Unknown'}. Raw: ${raw.slice(0, 200)}` };
  }
}

// ---------------------------------------------------------------------------
// Embedding Call
// ---------------------------------------------------------------------------

export async function getEmbedding(text: string, tenantId: string): Promise<StepResult<number[]>> {
  if (!text.trim()) {
    return { ok: false, error: 'Empty text for embedding' };
  }

  try {
    const client = await getClientForTenant(tenantId);
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    const embedding = response.data?.[0]?.embedding;

    if (!embedding || !Array.isArray(embedding)) {
      return { ok: false, error: 'Embedding response missing vector data' };
    }

    return { ok: true, data: embedding };
  } catch (err) {
    return { ok: false, error: `Embedding error: ${err instanceof Error ? err.message : 'Unknown'}` };
  }
}

export { EMBEDDING_DIMENSIONS };

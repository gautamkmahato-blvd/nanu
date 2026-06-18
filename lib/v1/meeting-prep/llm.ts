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

export async function callLLM(prompt: string, maxTokens: number = 2000): Promise<StepResult<string>> {
  if (!OPENROUTER_API_KEY) {
    return { ok: false, error: 'OPENROUTER_API_KEY not configured' };
  }

  try {
    const res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3, // low for factual accuracy
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => 'Unknown error');
      return { ok: false, error: `LLM call failed (${res.status}): ${err}` };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();

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

export async function getEmbedding(text: string): Promise<StepResult<number[]>> {
  if (!OPENROUTER_API_KEY) {
    return { ok: false, error: 'OPENROUTER_API_KEY not configured' };
  }

  if (!text.trim()) {
    return { ok: false, error: 'Empty text for embedding' };
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text,
        dimensions: EMBEDDING_DIMENSIONS,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => 'Unknown');
      return { ok: false, error: `Embedding call failed (${res.status}): ${err}` };
    }

    const data = await res.json();
    const embedding = data.data?.[0]?.embedding;

    if (!embedding || !Array.isArray(embedding)) {
      return { ok: false, error: 'Embedding response missing vector data' };
    }

    return { ok: true, data: embedding };
  } catch (err) {
    return { ok: false, error: `Embedding error: ${err instanceof Error ? err.message : 'Unknown'}` };
  }
}

export { EMBEDDING_DIMENSIONS };

// lib/v1/ai-chat/chat/analyze.ts
// LLM Call 1: Analyze the user's natural language query.
// Outputs structured filters + search terms + embedding text.

import { getClientForTenant } from '@/config/openrouter/config';
import { QUERY_ANALYSIS_PROMPT } from './prompts';
import type { QueryAnalysis } from '../types';
import { extractJsonFromLLM } from '@/lib/utils';

// const MODEL = 'google/gemini-2.5-flash-lite';
const MODEL = 'anthropic/claude-haiku-4.5';

const DEFAULT_ANALYSIS: QueryAnalysis = {
  filters: [],
  search_terms: '',
  embedding_text: '', 
  intent: 'general',
};

export async function analyzeQuery(
  userMessage: string,
  tenantId: string,
  conversationHistory?: { role: string; content: string }[],
): Promise<QueryAnalysis> {  try {
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: QUERY_ANALYSIS_PROMPT },
  ];
  
  // Include last 4 messages for follow-up context
  if (conversationHistory && conversationHistory.length > 0) {
    const recent = conversationHistory.slice(-4);
    for (const msg of recent) {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content.slice(0, 300),
      });
    }
  }
  
  messages.push({ role: 'user', content: userMessage });
  
  const client = await getClientForTenant(tenantId);
  const response = await client.chat.completions.create({
    model: MODEL,
    temperature: 0,
    max_tokens: 500,
    messages,
  });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
    if (!text) return DEFAULT_ANALYSIS;

    const parsed = extractJsonFromLLM(text);

    return {
      filters: Array.isArray(parsed.filters) ? parsed.filters : [],
      search_terms: String(parsed.search_terms ?? ''),
      embedding_text: String(parsed.embedding_text ?? userMessage),
      intent: ['find_emails', 'summarize', 'count', 'compare', 'general'].includes(parsed.intent as string)
        ? (parsed.intent as QueryAnalysis['intent'])
        : 'find_emails',
    };
  } catch (err) {
    console.error('[ai-chat] query analysis failed:', err);
    // Fallback: use the raw message as search terms
    return {
      filters: [],
      search_terms: userMessage,
      embedding_text: userMessage,
      intent: 'find_emails',
    };
  }
}
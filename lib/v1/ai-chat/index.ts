// lib/v1/ai-chat/index.ts
// Main orchestrator: query → analyze → 3 parallel searches → merge → answer.
//
// CHANGES:
// 1. Added `options` parameter: { skipAnswer?, conversationHistory? }
// 2. When skipAnswer=true, skips Mercury-2 answer generation (used by agent)
// 3. Passes conversationHistory to analyzeQuery for follow-up context
// 4. All search logic, pre-filter, merge UNCHANGED

import { analyzeQuery } from './chat/analyze';
import { generateAnswer } from './chat/answer';
import { structuredSearch } from './search/structured';
import { fulltextSearch } from './search/fulltext';
import { semanticSearch } from './embeddings/search';
import { mergeResults } from './search/merge';
import type { SearchResultEmail, QueryAnalysis } from './types';

export type ChatResponse = {
  answer: string;
  emails: SearchResultEmail[];
  analysis: QueryAnalysis;
  searchStats: {
    structured: number;
    fulltext: number;
    semantic: number;
    merged: number;
    timeMs: number;
  };
};

export type ChatQueryOptions = {
  skipAnswer?: boolean;
  conversationHistory?: { role: string; content: string }[];
};

// ---------------------------------------------------------------------------
// Pre-filter
// ---------------------------------------------------------------------------

const OFF_TOPIC_PATTERNS = [
  /^\d+\s*[+\-*/÷×]\s*\d+/,
  /^(what is|calculate|solve|compute)\s+\d/i,
  /^(write|compose|create|generate)\s+(me\s+)?(a\s+)?(poem|song|story|joke|essay|code|script|function|program|class|algorithm)/i,
  /^(tell me|give me)\s+(a\s+)?(joke|riddle|fun fact)/i,
  /^(who is|who was|when was|where is|what is the capital)/i,
  /^(how to|how do i)\s+(cook|bake|make food|install|fix my car|code|program|implement)/i,
  /^(translate|convert)\s/i,
  /^(play|sing|draw|paint)\s/i,
  /^(ignore|forget|disregard)\s+(your|all|previous)\s+(instructions|prompts|rules)/i,
];

const GREETINGS = /^(hi|hey|hello|good morning|good afternoon|good evening|what's up|howdy)[\s!?.]*$/i;

function preFilter(message: string): { blocked: true; answer: string } | { blocked: false } {
  const trimmed = message.trim();

  if (GREETINGS.test(trimmed)) {
    return { blocked: true, answer: "Hi! I'm your inbox assistant. Ask me anything about your emails — like 'show high-risk emails' or 'who is waiting on my response?'" };
  }

  if (OFF_TOPIC_PATTERNS.some((p) => p.test(trimmed))) {
    return { blocked: true, answer: "That's outside my scope — I'm your email search assistant. Try asking about your emails, like 'find emails about pricing' or 'show urgent emails I need to respond to'." };
  }

  return { blocked: false };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function handleChatQuery(
  userMessage: string,
  options?: ChatQueryOptions,
): Promise<ChatResponse> {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).slice(2, 8);
  const skipAnswer = options?.skipAnswer ?? false;
  const conversationHistory = options?.conversationHistory;

  console.log(`[ai-chat:${requestId}] ← query: "${userMessage.slice(0, 80)}"${skipAnswer ? ' [skipAnswer]' : ''}`);

  // Pre-filter
  const filter = preFilter(userMessage);
  if (filter.blocked) {
    console.log(`[ai-chat:${requestId}] [pre-filter] blocked in ${Date.now() - startTime}ms`);
    return {
      answer: filter.answer,
      emails: [],
      analysis: { filters: [], search_terms: '', embedding_text: '', intent: 'general' },
      searchStats: { structured: 0, fulltext: 0, semantic: 0, merged: 0, timeMs: Date.now() - startTime },
    };
  }

  // Step 1: Analyze the query (with conversation context if available)
  const analyzeStart = Date.now();
  const analysis = await analyzeQuery(userMessage, options?.conversationHistory);
  console.log(`[ai-chat:${requestId}] [1/4] analyze: ${Date.now() - analyzeStart}ms | intent=${analysis.intent} | filters=${analysis.filters.length} | terms="${analysis.search_terms.slice(0, 40)}"`);

  // Short-circuit for general intent
  if (analysis.intent === 'general') {
    if (skipAnswer) {
      return {
        answer: 'No email-related query detected.',
        emails: [],
        analysis,
        searchStats: { structured: 0, fulltext: 0, semantic: 0, merged: 0, timeMs: Date.now() - startTime },
      };
    }
    const answerStart = Date.now();
    const answer = await generateAnswer(userMessage, [], analysis);
    console.log(`[ai-chat:${requestId}] [skip] general intent | answer: ${Date.now() - answerStart}ms | total: ${Date.now() - startTime}ms`);
    return {
      answer,
      emails: [],
      analysis,
      searchStats: { structured: 0, fulltext: 0, semantic: 0, merged: 0, timeMs: Date.now() - startTime },
    };
  }

  // Step 2: Run all 3 search layers in parallel
  const searchStart = Date.now();

  const [structuredResults, fulltextResults, semanticResults] = await Promise.allSettled([
    analysis.filters.length > 0 ? structuredSearch(analysis.filters, 10) : Promise.resolve([]),
    analysis.search_terms ? fulltextSearch(analysis.search_terms, 10) : Promise.resolve([]),
    analysis.embedding_text
      ? semanticSearch(analysis.embedding_text, 10).catch((err) => {
          console.warn(`[ai-chat:${requestId}] semantic search failed: ${err instanceof Error ? err.message : err}`);
          return [];
        })
      : Promise.resolve([]),
  ]);

  const structured = structuredResults.status === 'fulfilled' ? structuredResults.value : [];
  const fulltext = fulltextResults.status === 'fulfilled' ? fulltextResults.value : [];
  const semantic = semanticResults.status === 'fulfilled' ? semanticResults.value : [];

  console.log(`[ai-chat:${requestId}] [2/4] search: ${Date.now() - searchStart}ms | structured=${structured.length} fulltext=${fulltext.length} semantic=${semantic.length}`);

  // Step 3: Merge with RRF
  const mergeStart = Date.now();
  const merged = mergeResults([
    { name: 'structured', results: structured },
    { name: 'fulltext', results: fulltext },
    { name: 'semantic', results: semantic },
  ], 10);

  console.log(`[ai-chat:${requestId}] [3/4] merge: ${Date.now() - mergeStart}ms | merged=${merged.length}`);

  // Step 4: Generate answer (SKIPPED when called from agent — agent writes its own)
  if (skipAnswer) {
    const totalMs = Date.now() - startTime;
    console.log(`[ai-chat:${requestId}] → done (skipAnswer): ${totalMs}ms | ${merged.length} results`);
    return {
      answer: `Found ${merged.length} matching email${merged.length !== 1 ? 's' : ''}.`,
      emails: merged,
      analysis,
      searchStats: { structured: structured.length, fulltext: fulltext.length, semantic: semantic.length, merged: merged.length, timeMs: totalMs },
    };
  }

  const answerStart = Date.now();
  const answer = await generateAnswer(userMessage, merged, analysis);
  console.log(`[ai-chat:${requestId}] [4/4] answer: ${Date.now() - answerStart}ms | length=${answer.length} chars`);

  const totalMs = Date.now() - startTime;
  console.log(`[ai-chat:${requestId}] → done: ${totalMs}ms | ${merged.length} results`);

  return {
    answer,
    emails: merged,
    analysis,
    searchStats: { structured: structured.length, fulltext: fulltext.length, semantic: semantic.length, merged: merged.length, timeMs: totalMs },
  };
}

export type { ChatMessage, SearchResultEmail, QueryAnalysis } from './types';

// lib/v1/ai-chat/chat/answer.ts
// LLM Call 2: Generate a natural language answer from search results.

import { getClientForTenant } from '@/config/openrouter/config';
import { ANSWER_GENERATION_PROMPT } from './prompts';
import type { SearchResultEmail, QueryAnalysis } from '../types';

// const MODEL = 'google/gemini-2.5-flash-lite';
const MODEL = 'anthropic/claude-haiku-4.5';

export async function generateAnswer(
  userMessage: string,
  results: SearchResultEmail[],
  analysis: QueryAnalysis,
  tenantId: string,
): Promise<string> { 
  // General intent — no search needed
  if (analysis.intent === 'general') {
    return generateGeneralAnswer(userMessage, tenantId);
  }

  // Build context from search results
  const emailContext = results.length > 0
    ? results.map((e, i) => {
        const sender = e.from_name || e.from_email;
        const summary = e.summary || e.snippet || '';
        const sources = e.match_sources.join(', ');
        return `[${i + 1}] From: ${sender} | Subject: ${e.subject ?? '(no subject)'} | ${summary} | Matched via: ${sources}`;
      }).join('\n')
    : 'No matching emails found.';

  try {
    const client = await getClientForTenant(tenantId);
    const response = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 800,
      messages: [
        { role: 'system', content: ANSWER_GENERATION_PROMPT },
        {
          role: 'user',
          content: `User question: "${userMessage}"\n\nIntent: ${analysis.intent}\nResults found: ${results.length}\n\nEmails:\n${emailContext}`,
        },
      ],
    });

    const answer = response.choices[0]?.message?.content?.trim();
    return answer || (results.length > 0
      ? `Found ${results.length} matching email${results.length > 1 ? 's' : ''}.`
      : 'No matching emails found. Try rephrasing your search.');
  } catch (err) {
    console.error('[ai-chat] answer generation failed:', err);
    return results.length > 0
      ? `Found ${results.length} matching email${results.length > 1 ? 's' : ''}.`
      : 'No matching emails found.';
  }
}

async function generateGeneralAnswer(userMessage: string, tenantId: string): Promise<string> {
  try {
    const client = await getClientForTenant(tenantId);
    const response = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.5,
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content: 'You are a friendly AI email assistant called Context Mode. Keep responses brief and helpful. If the user greets you, greet them back and tell them they can ask questions about their inbox.',
        },
        { role: 'user', content: userMessage },
      ],
    });
    return response.choices[0]?.message?.content?.trim() || "Hi! I'm your inbox assistant. Ask me anything about your emails.";
  } catch {
    return "Hi! I'm your inbox assistant. Ask me anything about your emails — like 'show high-risk emails' or 'find emails about pricing'.";
  }
}

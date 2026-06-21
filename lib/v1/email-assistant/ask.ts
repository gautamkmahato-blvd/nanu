// lib/v1/email-assistant/ask.ts
// Main entry: takes email context + user question, routes to direct/search/off_topic.
// FIXED: tenant_id filtering on getEmailContext + handleChatQuery search fallback.

import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { getClientForTenant } from '@/config/openrouter/config';
import { extractJsonFromLLM } from '@/lib/utils';
import { handleChatQuery } from '@/lib/v1/ai-chat';
import { EMAIL_ASSISTANT_PROMPT, buildEmailContext } from './prompts';
import type { AssistantResponse, EmailContext, ChatHistoryMessage } from './types';

const MODEL = 'deepseek/deepseek-v4-flash';

// ---------------------------------------------------------------------------
// Fetch email from DB (tenant-scoped)
// ---------------------------------------------------------------------------

export async function getEmailContext(emailId: string, tenantId: string): Promise<EmailContext | null> {
  const result = await db.execute(sql`
    SELECT id, subject, from_email, from_name, to_emails, body_text, received_at, ai_analysis
    FROM emails
    WHERE tenant_id = ${tenantId}
      AND id = ${emailId}
    LIMIT 1
  `);

  const row = result.rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;

  return {
    id: String(row.id),
    subject: (row.subject as string) ?? null,
    from_email: String(row.from_email),
    from_name: (row.from_name as string) ?? null,
    to_emails: Array.isArray(row.to_emails) ? row.to_emails : [],
    body_text: (row.body_text as string) ?? null,
    received_at: new Date(row.received_at as string).toISOString(),
    ai_analysis: (row.ai_analysis as Record<string, unknown>) ?? null,
  };
}

// ---------------------------------------------------------------------------
// LLM Call 1: Route the question
// ---------------------------------------------------------------------------

type RouteResult =
  | { type: 'direct'; answer: string }
  | { type: 'search'; search_query: string }
  | { type: 'off_topic'; answer: string };

async function routeQuestion(
  email: EmailContext,
  userMessage: string,
  history: ChatHistoryMessage[],
  tenantId: string,
): Promise<RouteResult> {
  const emailContext = buildEmailContext(email);

  // Build messages with history for context
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: EMAIL_ASSISTANT_PROMPT },
    { role: 'user', content: `EMAIL CONTEXT:\n${emailContext}` },
    { role: 'assistant', content: '{"type": "direct", "answer": "I have the email context loaded. What would you like to know?"}' },
  ];

  // Add conversation history (last 10 messages max)
  for (const msg of history.slice(-10)) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // Add current question
  messages.push({ role: 'user', content: userMessage });

  try {
    const client = await getClientForTenant(tenantId);
    const response = await client.chat.completions.create({
      model: MODEL,
      temperature: 0,
      max_tokens: 2000,
      messages,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
    if (!text) return { type: 'direct', answer: 'I could not process your question. Please try again.' };

    let parsed: Record<string, unknown>;
    try {
      parsed = extractJsonFromLLM(text);
    } catch {
      // LLM response was truncated or malformed JSON
      // Try to extract a partial answer from the raw text
      const answerMatch = text.match(/"answer"\s*:\s*"([\s\S]*)/);
      if (answerMatch) {
        // Extract whatever answer text we got before truncation
        let partialAnswer = answerMatch[1]
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/"\s*}?\s*$/, ''); // clean trailing
        return { type: 'direct', answer: partialAnswer };
      }
      // Can't extract anything — return the raw text as the answer
      return { type: 'direct', answer: text.replace(/^\{[\s\S]*?"answer"\s*:\s*"?/, '').replace(/"?\s*}?\s*$/, '') || 'I could not generate a complete response. Please try again.' };    
    }

    const routeType = parsed.type as string;

    if (routeType === 'search' && typeof parsed.search_query === 'string' && parsed.search_query.trim()) {
      return { type: 'search', search_query: parsed.search_query.trim() };
    }

    if (routeType === 'off_topic' && typeof parsed.answer === 'string') {
      return { type: 'off_topic', answer: parsed.answer };
    }

    // Default to direct — safest fallback
    return {
      type: 'direct',
      answer: typeof parsed.answer === 'string' ? parsed.answer : text,
    };
  } catch (err) {
    console.error('[email-assistant] routing failed:', err);
    return { type: 'direct', answer: 'Something went wrong. Please try again.' };
  }
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

export async function askAboutEmail(
  emailId: string,
  userMessage: string,
  history: ChatHistoryMessage[] = [],
  tenantId: string = 'default',
): Promise<AssistantResponse> {
  // Validate
  if (!userMessage.trim()) {
    return { type: 'off_topic', answer: 'Please ask a question about this email.' };
  }

  // Fetch email — scoped to tenant so users can only access their own emails
  const email = await getEmailContext(emailId, tenantId);
  if (!email) {
    return { type: 'off_topic', answer: 'Email not found.' };
  }

  // Route the question
  const route = await routeQuestion(email, userMessage.trim(), history, tenantId);

  // Handle direct and off_topic — no search needed
  if (route.type === 'direct' || route.type === 'off_topic') {
    return { type: route.type, answer: route.answer };
  }

  // Handle search — use the existing hybrid search pipeline (tenant-scoped)
  try {
    const searchResult = await handleChatQuery(route.search_query, { tenantId });

    return {
      type: 'search',
      answer: searchResult.answer,
      emails: searchResult.emails.map((e) => ({
        id: e.id,
        thread_id: e.thread_id,
        subject: e.subject,
        from_email: e.from_email,
        from_name: e.from_name,
        summary: e.summary,
        received_at: e.received_at,
        match_sources: e.match_sources,
      })),
      searchStats: searchResult.searchStats,
    };
  } catch (err) {
    console.error('[email-assistant] search failed:', err);
    return { type: 'direct', answer: 'Search failed. Please try again.' };
  }
}
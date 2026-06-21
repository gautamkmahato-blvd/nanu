// lib/v1/ai-chat/guardrail.ts
// Fast guardrail using morph/morph-v3-fast.
// Single-turn, minimal prompt, ~100-200ms.
// Returns 'email' or 'not_email'.

import { getClientForTenant } from '@/config/openrouter/config';

const GUARDRAIL_MODEL = 'inception/mercury-2';

const CLASSIFICATION_PROMPT = `Classify this user query. Is it about emails, inbox, or messages? Reply with ONLY one word: "email" or "other"

Rules:
- "email" = anything about finding emails, inbox summary, urgent messages, who emailed me, priorities, deadlines, follow-ups, sender questions, reply drafts
- "other" = math, science, general knowledge, poems, jokes, coding, definitions, translations, anything NOT about emails

Examples:
"find emails about pricing" → email
"what is an egg" → other
"show urgent emails" → email
"write me a poem" → other
"who is waiting on my response" → email
"what is 2+2" → other
"summarize my inbox" → email
"tell me a joke" → other
"what should I focus on today" → email
"translate hello to french" → other
"any deadlines this week" → email
"how to cook pasta" → other

Query: `;


export async function guardrailCheck(userMessage: string, tenantId: string): Promise<'email' | 'not_email'> {
  try {
    const client = await getClientForTenant(tenantId);
    const response = await client.chat.completions.create({
      model: GUARDRAIL_MODEL,
      temperature: 0,
      max_tokens: 5,
      messages: [
        {
          role: 'user',
          content: CLASSIFICATION_PROMPT + `"${userMessage.slice(0, 200)}"`,
        },
      ],
    });

    const result = response.choices[0]?.message?.content?.trim().toLowerCase() ?? '';

    if (result.includes('email')) return 'email';
    return 'not_email';
  } catch (err) {
    console.warn('[guardrail] morph call failed, allowing through:', err instanceof Error ? err.message : err);
    // On failure, allow through — don't block legitimate queries
    return 'email';
  }
}
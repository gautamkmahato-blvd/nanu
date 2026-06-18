// lib/v1/ai-agent/agent.ts
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import openRouterClient from '@/config/openrouter/config';
import { initializeTools, executeToolWithTimeout, generatePreview, DESTRUCTIVE_TOOLS } from './tools';
import type { AgentRequest, AgentResponse, EmailContext, SearchResultEmail, AssetResult } from './types';

const MODEL = 'anthropic/claude-haiku-4-5';
const MAX_ITERATIONS = 8;

function buildSystemPrompt(emailContext?: EmailContext): string {
  const base = `You are an AI assistant for Context Mode, an email and calendar workspace. You can perform real actions using tools.

RULES:
1. When the user asks to send, reply, schedule, or search — use the appropriate tool. Do NOT just describe what you would do.
2. Write professional, concise content unless told otherwise.
3. For calendar events without a specified time, use check_availability first to find open slots.
4. After executing an action, confirm what was done in 1-2 sentences.
5. If ambiguous, ask a clarifying question instead of guessing.
6. Today: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
7. When the user asks about files, attachments, PDFs, documents, images, spreadsheets, or shared links — use search_assets. Be specific with the category filter when the user mentions a file type.
8. When the user says "find the [file] from [person]" — use search_assets with both query and from parameters.
9. Use search_inbox for email content questions. Use search_assets for file/attachment/link questions. If unsure, try both.`;

  if (!emailContext) return base;

  return `${base}

CURRENT EMAIL (the user is viewing this):
Subject: ${emailContext.subject}
From: ${emailContext.fromName ?? emailContext.fromEmail} <${emailContext.fromEmail}>
To: ${emailContext.toEmails.join(', ')}
Thread ID: ${emailContext.threadId}
Preview: ${emailContext.bodySnippet}

When the user says "reply"/"respond" — use reply_to_email with this thread.
When they say "schedule meeting with them" — use the sender's email as attendee.`;
}

export async function runAgent(request: AgentRequest): Promise<AgentResponse> {
  const { message, conversationHistory, emailContext, pendingAction, confirmed, tenantId } = request;
  const tid = tenantId ?? 'default';
  const toolsUsed: string[] = [];
  const collectedEmails: SearchResultEmail[] = [];
  const collectedAssets: AssetResult[] = [];

  try {
    const tools = await initializeTools(!!emailContext) as ChatCompletionTool[];

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: buildSystemPrompt(emailContext) },
    ];

    if (conversationHistory) {
      for (const msg of conversationHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // --- Confirmation resume ---
    if (pendingAction && confirmed === true) {
      toolsUsed.push(pendingAction.tool);
      const result = await executeToolWithTimeout(pendingAction.tool, pendingAction.args, emailContext ? { threadId: emailContext.threadId } : undefined, tid);

      messages.push({ role: 'user', content: message });
      messages.push({
        role: 'assistant',
        content: null,
        tool_calls: [{
          id: pendingAction.callId,
          type: 'function' as const,
          function: { name: pendingAction.tool, arguments: JSON.stringify(pendingAction.args) },
        }],
      });
      messages.push({ role: 'tool', tool_call_id: pendingAction.callId, content: JSON.stringify(result) });

      const finalRes = await openRouterClient.chat.completions.create({ model: MODEL, max_tokens: 500, messages });
      return { status: 'done', message: finalRes.choices[0]?.message?.content ?? 'Action completed.', toolsUsed, emails: collectedEmails, assets: collectedAssets };
    }

    // --- Confirmation rejection ---
    if (pendingAction && confirmed === false) {
      return { status: 'done', message: 'Action cancelled.', toolsUsed, emails: [], assets: [] };
    }

    // --- Normal flow ---
    messages.push({ role: 'user', content: message });

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = await openRouterClient.chat.completions.create({ model: MODEL, max_tokens: 2000, tools, messages });

      const choice = response.choices[0];
      if (!choice) return { status: 'error', message: 'No LLM response', toolsUsed, emails: [], assets: [] };

      const assistantMsg = choice.message;
      const toolCalls = assistantMsg.tool_calls;

      if (!toolCalls || toolCalls.length === 0) {
        return { status: 'done', message: assistantMsg.content ?? '', toolsUsed, emails: collectedEmails, assets: collectedAssets };
      }

      messages.push({
        role: 'assistant',
        content: assistantMsg.content ?? null,
        tool_calls: toolCalls
          .filter((tc): tc is typeof tc & { type: 'function'; function: { name: string; arguments: string } } => tc.type === 'function' && 'function' in tc)
          .map((tc) => ({
            id: tc.id,
            type: 'function' as const,
            function: { name: tc.function.name, arguments: tc.function.arguments },
          })),
      });

      for (const tc of toolCalls) {
        if (tc.type !== 'function' || !('function' in tc)) continue;
        const fnName = tc.function.name;
        let args: Record<string, unknown>;
        try { args = JSON.parse(tc.function.arguments ?? '{}'); } catch { args = {}; }

        toolsUsed.push(fnName);

        if (DESTRUCTIVE_TOOLS.has(fnName)) {
          const preview = generatePreview(fnName, args);
          return {
            status: 'needs_confirmation',
            message: `I'd like to perform this action:\n\n${preview}\n\nShall I proceed?`,
            pendingAction: { callId: tc.id, tool: fnName, args, preview },
            toolsUsed,
            emails: collectedEmails,
            assets: collectedAssets,
          };
        }

        const result = await executeToolWithTimeout(fnName, args, emailContext ? { threadId: emailContext.threadId } : undefined, tid);

        // Capture emails from search_inbox for UI rendering
        if (fnName === 'search_inbox' && result.success) {
          const data = result.data as { emails?: SearchResultEmail[] };
          if (data?.emails && Array.isArray(data.emails)) {
            collectedEmails.push(...data.emails);
          }
        }

        // Capture assets from search_assets for UI rendering
        if (fnName === 'search_assets' && result.success) {
          const data = result.data as { assets?: AssetResult[] };
          if (data?.assets && Array.isArray(data.assets)) {
            collectedAssets.push(...data.assets);
          }
        }

        messages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
      }
    }

    return { status: 'error', message: 'Reached maximum iterations.', toolsUsed, emails: [], assets: [] };
  } catch (err) {
    console.error('[ai-agent] error:', err instanceof Error ? err.message : err);
    return { status: 'error', message: err instanceof Error ? err.message : 'Agent failed', toolsUsed, emails: [], assets: [] };
  }
}
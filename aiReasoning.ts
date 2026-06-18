import type OpenAI from 'openai';
import openRouterClient from '@/config/openrouter/config';
import { EMAIL_ANALYSIS_SYSTEM_PROMPT } from './lib/v1/ai/prompts/analysis-prompt';

type ORChatMessage = {
  role: string;
  content: string | null;
  reasoning_details?: unknown;
};

export interface RecreateFromScreenshotResult {
  code: string;
}

const MODEL = 'deepseek/deepseek-v4-flash';

export default async function aiReasoning(
  input: string,
): Promise<{ status: boolean; result?: string; message: string }> {
  console.log('===================================================');
  console.log('AI_ANALYSIS_STARTS_HERE');
  console.log('===================================================');

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return { status: false, message: 'OPENROUTER_API_KEY is not configured or is empty.' };
  }

  if (!input) {
    return { status: false, message: 'input is required.' };
  }

  const userPrompt = input;

  try {
    console.log('[geminiReasoning] model:', MODEL);

    const apiResponse = await openRouterClient.chat.completions.create({
      model: MODEL,
      stream: false,
      messages: [
        {
          role: 'system',
          content: EMAIL_ANALYSIS_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
          ] as OpenAI.ChatCompletionContentPart[],
        },
      ],
    });

    const response = apiResponse.choices[0]?.message as ORChatMessage | undefined;
    const result = response?.content?.trim() ?? '';

    if (!result) {
      return {
        status: false,
        message: 'Gemini returned an empty response.',
      };
    }

    return {
      status: true,
      result,
      message: 'Successfully recreated the component with Gemini.',
    };
  } catch (err) {
    console.error('[geminiReasoning] Error:', err);
    return {
      status: false,
      message: err instanceof Error ? err.message : 'Unknown error occurred.',
    };
  }
}

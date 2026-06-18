import type OpenAI from 'openai';
import openRouterClient from '@/config/openrouter/config';
import { EMAIL_ANALYSIS_SYSTEM_PROMPT } from '@/lib/v1/ai/prompts/analysis-prompt';
import { EMAIL_CLASSIFICATION_TAXONOMY } from '@/lib/v1/ai/prompts/classification-prompt';

type ChatMessage = {
  role: string;
  content: string | null;
  reasoning_details?: unknown;
};

// const MODEL = 'deepseek/deepseek-v4-flash';
const MODEL = 'qwen/qwen3.6-flash';

export default async function openRouterAnalysis(
  input: string,
): Promise<{ status: boolean; result?: string; message: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return { status: false, message: 'OPENROUTER_API_KEY is not configured or is empty.' };
  }

  if (!input) {
    return { status: false, message: 'input is required.' };
  }

  const userPrompt = `
    Use the following classification taxonomy when selecting:

    * category
    * industry
    * topic_cluster

    ${EMAIL_CLASSIFICATION_TAXONOMY}

    --------------------------------------------------------

    Analyze the following email.
      ${input}

    Return the JSON response according to the system instructions.

  `;

  try {

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

    const response = apiResponse.choices[0]?.message as ChatMessage | undefined;
    const result = response?.content?.trim() ?? '';

    // ADD THESE — see exactly what the LLM returns
    console.log(`[ai:raw] length: ${result.length}`);
    console.log(`[ai:raw] first 300 chars:`, result.slice(0, 300));

    if (!result) {
      return {
        status: false,
        message: 'Gemini returned an empty response.',
      };
    }

    return {
      status: true,
      result: result,
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

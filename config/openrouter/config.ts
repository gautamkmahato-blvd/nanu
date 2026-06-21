// config/openrouter/config.ts
import OpenAI from 'openai';
import { getOpenRouterClient } from '@/lib/v1/user-settings/limits';

const openRouterClient = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export default openRouterClient;

export async function getClientForTenant(tenantId?: string): Promise<OpenAI> {
  if (!tenantId || tenantId === 'default') return openRouterClient;

  try {
    return await getOpenRouterClient(tenantId);
  } catch {
    return openRouterClient;
  }
}
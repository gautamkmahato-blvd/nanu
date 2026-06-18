import OpenAI from 'openai';

const OPENROUTER_BASE_URL='https://openrouter.ai/api/v1';

const openRouterClient = new OpenAI({
  baseURL: OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
});

export default openRouterClient;
// lib/v1/user-settings/limits.ts
// Warm client cache + usage tracking.
// Pattern: resolve tenant's OpenAI client ONCE, cache for 30 min.
// Subsequent calls = Map.get() — zero DB, zero async overhead.

import OpenAI from 'openai';
import { getDailyUsage, getDecryptedApiKey, getUserSettings, hasByokKey, incrementUsage } from './queries';
import { FREE_CHAT_LIMIT, FREE_SYNC_LIMIT, MAX_SYNC_LIMIT } from './types';
import type { UsageLimits, UsageSource } from './types';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const CLIENT_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const BYOK_CACHE_TTL = 5 * 60 * 1000;    // 5 minutes for boolean check

// ---------------------------------------------------------------------------
// Platform client singleton — created once on startup
// ---------------------------------------------------------------------------

const platformClient = new OpenAI({
  baseURL: OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// ---------------------------------------------------------------------------
// Warm client cache — stores FULL OpenAI client per tenant
// After first resolution, returns instantly from memory
// ---------------------------------------------------------------------------

const clientCache = new Map<string, { client: OpenAI; expiresAt: number }>();

export async function getOpenRouterClient(tenantId: string): Promise<OpenAI> {
  if (!tenantId || tenantId === 'default') return platformClient;

  // Warm cache hit — instant return, no DB, no async overhead
  const cached = clientCache.get(tenantId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.client;
  }

  // Cache miss — resolve from DB (happens once per 30 min per tenant)
  try {
    const userKey = await getDecryptedApiKey(tenantId);
    const client = userKey
      ? new OpenAI({ baseURL: OPENROUTER_BASE_URL, apiKey: userKey })
      : platformClient;

    clientCache.set(tenantId, { client, expiresAt: Date.now() + CLIENT_CACHE_TTL });
    return client;
  } catch (err) {
    console.warn('[user-settings] client resolution failed, using platform key:', err instanceof Error ? err.message : err);
    return platformClient;
  }
}

/** Call when user adds/removes API key */
export function invalidateClientCache(tenantId: string): void {
  clientCache.delete(tenantId);
  byokCache.delete(tenantId);
}

// ---------------------------------------------------------------------------
// BYOK status cache — lightweight boolean check
// ---------------------------------------------------------------------------

const byokCache = new Map<string, { isByok: boolean; expiresAt: number }>();

async function isByokUser(tenantId: string): Promise<boolean> {
  const cached = byokCache.get(tenantId);
  if (cached && cached.expiresAt > Date.now()) return cached.isByok;

  try {
    const isByok = await hasByokKey(tenantId);
    byokCache.set(tenantId, { isByok, expiresAt: Date.now() + BYOK_CACHE_TTL });
    return isByok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Usage limits
// ---------------------------------------------------------------------------

export async function getUsageLimits(tenantId: string): Promise<UsageLimits> {
  const [isByok, usage, settings] = await Promise.all([
    isByokUser(tenantId),
    getDailyUsage(tenantId),
    getUserSettings(tenantId),
  ]);

  const syncLimit = isByok ? (settings?.syncLimit ?? 100) : FREE_SYNC_LIMIT;

  return {
    chatLimit: isByok ? -1 : FREE_CHAT_LIMIT,
    chatUsed: usage.chatCount,
    chatRemaining: isByok ? -1 : Math.max(0, FREE_CHAT_LIMIT - usage.chatCount),
    syncLimit,
    isByok,
    isUnlimited: isByok,
  };
}

// ---------------------------------------------------------------------------
// Check + consume a chat credit
// ---------------------------------------------------------------------------

export async function checkAndConsumeChat(
  tenantId: string,
  source: UsageSource,
): Promise<{ allowed: true; remaining: number } | { allowed: false; error: string }> {
  const isByok = await isByokUser(tenantId);

  // BYOK users: unlimited, just track for analytics
  if (isByok) {
    await incrementUsage(tenantId, source, true); 
    return { allowed: true, remaining: -1 };
  }

  // Free users: check limit
  const usage = await getDailyUsage(tenantId);
  if (usage.chatCount >= FREE_CHAT_LIMIT) {
    return {
      allowed: false,
      error: `Daily AI chat limit reached (${FREE_CHAT_LIMIT}/${FREE_CHAT_LIMIT}). Add your own OpenRouter API key in AI Settings to get unlimited access.`,
    };
  }

  const newCount = await incrementUsage(tenantId, source);
  const remaining = Math.max(0, FREE_CHAT_LIMIT - newCount);
  return { allowed: true, remaining };
}

// ---------------------------------------------------------------------------
// Sync limit
// ---------------------------------------------------------------------------

export async function getSyncLimit(tenantId: string): Promise<number> {
  const isByok = await isByokUser(tenantId);
  if (!isByok) return FREE_SYNC_LIMIT;

  try {
    const settings = await getUserSettings(tenantId);
    return Math.min(settings?.syncLimit ?? 100, MAX_SYNC_LIMIT);
  } catch {
    return FREE_SYNC_LIMIT;
  }
}

// ---------------------------------------------------------------------------
// Validate an API key
// ---------------------------------------------------------------------------

export async function validateApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const client = new OpenAI({ baseURL: OPENROUTER_BASE_URL, apiKey });
    await client.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      max_tokens: 5,
      messages: [{ role: 'user', content: 'Hi' }],
    });
    return { valid: true };
  } catch (err: any) {
    if (err?.status === 401 || err?.message?.includes('401')) {
      return { valid: false, error: 'Invalid API key. Please check and try again.' };
    }
    if (err?.status === 402) {
      return { valid: false, error: 'API key has no credits. Please add funds to your OpenRouter account.' };
    }
    return { valid: false, error: err?.message ?? 'Failed to validate API key' };
  }
}
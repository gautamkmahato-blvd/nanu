// lib/v1/rate-limit/index.ts
// Upstash Redis rate limiting with tiered limits per route type.
// Sliding window algorithm — no burst-at-boundary problem.

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ---------------------------------------------------------------------------
// Redis client — HTTP-based, works in Edge + Node
// ---------------------------------------------------------------------------

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ---------------------------------------------------------------------------
// Ephemeral cache — prevents hitting Redis on every single request
// If a user is already rate-limited, reject locally without a round-trip
// ---------------------------------------------------------------------------

const ephemeralCache = new Map();

// ---------------------------------------------------------------------------
// Rate limiters — one per tier
// ---------------------------------------------------------------------------

/** AI routes: ai-agent, ai-chat, email-assistant — expensive, limit harder */
export const aiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: 'rl:ai',
  ephemeralCache,
});

/** Sync route — very expensive (fetches + AI analysis per email) */
export const syncLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: 'rl:sync',
  ephemeralCache,
});

/** General API: inbox, threads, calendar, contacts, assets, etc. */
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, '1 m'),
  analytics: true,
  prefix: 'rl:api',
  ephemeralCache,
});

/** Public routes: booking page — rate limit by IP, not tenant */
export const publicLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
  prefix: 'rl:public',
  ephemeralCache,
});

/** Auth/Settings — prevent brute force */
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
  prefix: 'rl:auth',
  ephemeralCache,
});

/** Webhooks — higher limit, these come from Google/external services */
export const webhookLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'rl:webhook',
  ephemeralCache,
});

export { redis };
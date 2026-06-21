// lib/v1/rate-limit/check.ts
// One-line rate limit check for API routes.
// Usage: const rl = await rateLimit(request, aiLimiter, tenantId);
//        if (rl) return rl;  // returns 429 response if limited

import { NextResponse } from 'next/server';
import type { Ratelimit } from '@upstash/ratelimit';

// ---------------------------------------------------------------------------
// Get identifier — tenantId for authenticated, IP for public
// ---------------------------------------------------------------------------

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();

  return 'anonymous';
}

// ---------------------------------------------------------------------------
// Rate limit check — returns null if allowed, NextResponse if blocked
// ---------------------------------------------------------------------------

export async function rateLimit(
  request: Request,
  limiter: Ratelimit,
  identifier?: string,
): Promise<NextResponse | null> {
  // Use provided identifier (tenantId) or fall back to IP
  const id = identifier || getClientIp(request);

  try {
    const { success, limit, remaining, reset } = await limiter.limit(id);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Too many requests. Please slow down.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(reset).toISOString(),
            'Retry-After': retryAfter.toString(),
          },
        },
      );
    }

    // Allowed — return null (no blocking response)
    return null;
  } catch (err) {
    // If Redis is down, allow the request through (fail-open)
    // Better to serve than to block everyone because Redis is unreachable
    console.warn('[rate-limit] Redis check failed, allowing through:', err instanceof Error ? err.message : err);
    return null;
  }
}
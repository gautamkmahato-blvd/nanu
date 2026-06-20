// lib/v1/booking/rate-limit.ts
// Simple in-memory IP-based rate limiter for public booking APIs.
// Resets on server restart — acceptable for single-server deployment.

type RateLimitEntry = { count: number; resetAt: number };

const store = new Map<string, RateLimitEntry>();

// Persist across hot reloads in dev
const globalForRateLimit = globalThis as typeof globalThis & { bookingRateLimit?: Map<string, RateLimitEntry> };
if (process.env.NODE_ENV !== 'production') {
  if (!globalForRateLimit.bookingRateLimit) globalForRateLimit.bookingRateLimit = store;
}
const rateStore = globalForRateLimit.bookingRateLimit ?? store;

// Cleanup stale entries every 5 minutes
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;
  for (const [key, entry] of rateStore) {
    if (entry.resetAt < now) rateStore.delete(key);
  }
}

/**
 * Check and consume a rate limit.
 * @returns { allowed, remaining, retryAfterMs }
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  cleanup();
  const now = Date.now();
  const entry = rateStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfterMs: 0 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, retryAfterMs: 0 };
}

// ---------------------------------------------------------------------------
// Pre-configured limiters for booking endpoints
// ---------------------------------------------------------------------------

/** Availability API — 30 requests per minute per IP */
export function limitAvailability(ip: string) {
  return checkRateLimit(`avail:${ip}`, 30, 60_000);
}

/** OTP send — 5 per hour per IP, 3 per hour per email */
export function limitOtpByIp(ip: string) {
  return checkRateLimit(`otp-ip:${ip}`, 5, 3600_000);
}
export function limitOtpByEmail(email: string) {
  return checkRateLimit(`otp-email:${email}`, 3, 3600_000);
}

/** Booking — 5 per hour per IP */
export function limitBooking(ip: string) {
  return checkRateLimit(`book:${ip}`, 5, 3600_000);
}

import { Redis } from '@upstash/redis';

let warnedMissingConfig = false;
let client: Redis | null = null;

export function isRedisEnabled(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

export function getRedisClient(): Redis | null {
  if (!isRedisEnabled()) {
    if (process.env.NODE_ENV === 'development' && !warnedMissingConfig) {
      warnedMissingConfig = true;
      console.warn(
        '[cache] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — cache disabled, using DB only',
      );
    }

    return null;
  }

  if (!client) {
    client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  return client;
}

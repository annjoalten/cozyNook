/**
 * In-memory sliding window rate limiter.
 * Safe for single-instance deployments (personal home app).
 *
 * Usage:
 *   const result = rateLimit(ip, { limit: 5, windowMs: 15 * 60 * 1000 })
 *   if (!result.allowed) return 429
 */

interface Entry {
  timestamps: number[];
}

const store = new Map<string, Entry>();

interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch ms when the oldest timestamp expires
}

export function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const entry = store.get(key) ?? { timestamps: [] };

  // Prune timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  const remaining = limit - entry.timestamps.length;
  const resetAt =
    entry.timestamps.length > 0
      ? entry.timestamps[0] + windowMs
      : now + windowMs;

  if (entry.timestamps.length >= limit) {
    store.set(key, entry);
    return { allowed: false, remaining: 0, resetAt };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return { allowed: true, remaining: remaining - 1, resetAt };
}

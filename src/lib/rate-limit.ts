/**
 * Simple in-memory sliding window rate limiter.
 * Uses a Map keyed by (identifier + route) storing timestamps of recent requests.
 * No external dependencies.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.timestamps.length === 0 || now - entry.timestamps[entry.timestamps.length - 1] > 60_000) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  limit?: number;
  /** Window duration in milliseconds (default: 60 000 ms = 1 minute) */
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check and record a request for the given key.
 * Returns whether the request is allowed, how many requests remain, and when the window resets.
 */
export function rateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const limit = options.limit ?? 60;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();
  const windowStart = now - windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Slide the window: discard timestamps older than the window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= limit) {
    // The earliest timestamp in the window is when the oldest slot was used
    const oldest = entry.timestamps[0];
    const resetAt = oldest + windowMs;
    return { allowed: false, remaining: 0, resetAt };
  }

  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    resetAt: now + windowMs,
  };
}

/**
 * Extract the client IP from a Next.js request.
 * Checks x-forwarded-for first, then x-real-ip, then falls back to "unknown".
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; take the first (original client)
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

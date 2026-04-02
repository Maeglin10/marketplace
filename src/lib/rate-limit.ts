/**
 * Rate limiter avec double backend :
 * - Upstash Redis si UPSTASH_REDIS_REST_URL est défini (recommandé en production)
 * - Fallback in-memory sliding window pour le développement local
 *
 * L'interface publique (rateLimit, getClientIp) est identique dans les deux cas.
 */

// ---------------------------------------------------------------------------
// Types partagés
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Backend Upstash Redis
// ---------------------------------------------------------------------------

let upstashRatelimit: ((key: string, limit: number, windowMs: number) => Promise<RateLimitResult>) | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  // Import dynamique pour ne pas charger le module si les variables sont absentes
  try {
    const { Ratelimit } = require('@upstash/ratelimit') as typeof import('@upstash/ratelimit');
    const { Redis } = require('@upstash/redis') as typeof import('@upstash/redis');

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Cache des instances Ratelimit pour éviter de recréer un objet à chaque appel
    const limiterCache = new Map<string, InstanceType<typeof Ratelimit>>();

    upstashRatelimit = async (
      key: string,
      limit: number,
      windowMs: number
    ): Promise<RateLimitResult> => {
      const cacheKey = `${limit}:${windowMs}`;
      let limiter = limiterCache.get(cacheKey);

      if (!limiter) {
        limiter = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
          analytics: false,
        });
        limiterCache.set(cacheKey, limiter);
      }

      const { success, remaining, reset } = await limiter.limit(key);

      return {
        allowed: success,
        remaining,
        resetAt: reset,
      };
    };
  } catch (err) {
    console.warn("[rate-limit] Impossible d'initialiser Upstash — fallback in-memory", err);
  }
}

// ---------------------------------------------------------------------------
// Backend in-memory (développement / fallback)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (
      entry.timestamps.length === 0 ||
      now - entry.timestamps[entry.timestamps.length - 1] > 60_000
    ) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

function rateLimitInMemory(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
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

// ---------------------------------------------------------------------------
// Interface publique unifiée
// ---------------------------------------------------------------------------

/**
 * Check and record a request for the given key.
 * Uses Upstash Redis if configured, otherwise falls back to in-memory store.
 * Returns whether the request is allowed, how many requests remain, and when the window resets.
 */
export async function rateLimit(
  key: string,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const limit = options.limit ?? 60;
  const windowMs = options.windowMs ?? 60_000;

  if (upstashRatelimit) {
    return upstashRatelimit(key, limit, windowMs);
  }

  return rateLimitInMemory(key, limit, windowMs);
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

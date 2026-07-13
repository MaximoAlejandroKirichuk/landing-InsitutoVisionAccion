/**
 * Minimal in-memory per-IP rate limiter for Node standalone (single instance).
 *
 * THREAD SAFETY WARNING — This implementation uses a plain Map and is NOT safe
 * for multi-process or clustered deployments. Each Node process maintains its
 * own isolated counter. When scaling horizontally behind a reverse proxy or
 * running with cluster/pm2, use platform/edge rate limiting (e.g. a reverse
 * proxy, WAF, or managed service) in addition to, or instead of, this helper.
 */

export interface RateLimiterConfig {
  /** Maximum number of requests allowed within the window. */
  maxRequests: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

interface ClientBucket {
  count: number;
  resetAt: number;
}

const DEFAULT_CONFIG: RateLimiterConfig = {
  maxRequests: 5,
  windowMs: 10 * 60 * 1000, // 10 minutes
};

export class RateLimiter {
  private readonly buckets = new Map<string, ClientBucket>();
  readonly config: RateLimiterConfig;

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Returns true if the request is allowed, false if rate-limited. */
  allow(key: string): boolean {
    const now = Date.now();
    this.evictStale(now);

    const existing = this.buckets.get(key);

    if (!existing || now >= existing.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + this.config.windowMs });
      return true;
    }

    if (existing.count >= this.config.maxRequests) {
      return false;
    }

    existing.count += 1;
    return true;
  }

  /** Returns the number of remaining requests for this key (0 if exhausted). */
  remaining(key: string): number {
    const now = Date.now();
    const existing = this.buckets.get(key);
    if (!existing || now >= existing.resetAt) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - existing.count);
  }

  /** Returns the Unix timestamp (ms) when the window resets. */
  resetAt(key: string): number {
    const existing = this.buckets.get(key);
    return existing ? existing.resetAt : Date.now() + this.config.windowMs;
  }

  /** Removes all expired buckets. Call periodically from `allow`. */
  private evictStale(now: number): void {
    for (const [key, bucket] of this.buckets) {
      if (now >= bucket.resetAt) {
        this.buckets.delete(key);
      }
    }
  }
}

/**
 * Extracts a safe client IP for rate-limiting purposes.
 *
 * Strategy (ordered by trust):
 * 1. Astro's `clientAddress` — the direct socket remote address (Node adapter).
 *    This is the safest source and does not require opt-in.
 * 2. When `TRUST_PROXY_HEADERS=true` is set, probe `x-forwarded-for`
 *    (leftmost entry) and `x-real-ip`. Only enable this when you are
 *    certain the reverse proxy strips/overwrites these headers.
 * 3. `cf-connecting-ip` — set by Cloudflare at the edge (not user-spoofable).
 * 4. Fallback to `"unknown"` — the rate limiter will still work, but all
 *    unidentifiable requests share a single bucket.
 *
 * @param request      The incoming Request object.
 * @param clientAddress Optional trusted direct-socket address from Astro's
 *                      `APIContext.clientAddress` (Node adapter only).
 */
export function extractClientIp(
  request: Request,
  clientAddress?: string,
): string {
  // 1. Astro-provided direct socket address — safest, no opt-in required.
  if (clientAddress) return clientAddress;

  // 2. Proxy-forwarded headers — only trusted with explicit opt-in.
  if (process.env.TRUST_PROXY_HEADERS === 'true') {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      const first = forwarded.split(',')[0]?.trim();
      if (first) return first;
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) return realIp.trim();
  }

  // 3. Cloudflare edge header — set by CF, not user-controlled.
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  return 'unknown';
}

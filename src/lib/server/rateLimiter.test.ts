import { describe, expect, it, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { RateLimiter, extractClientIp } from './rateLimiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests within the limit', () => {
    const limiter = new RateLimiter({ maxRequests: 3, windowMs: 60000 });
    expect(limiter.allow('127.0.0.1')).toBe(true);
    expect(limiter.allow('127.0.0.1')).toBe(true);
    expect(limiter.allow('127.0.0.1')).toBe(true);
  });

  it('blocks requests once the limit is reached', () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 60000 });
    limiter.allow('127.0.0.1'); // 1
    limiter.allow('127.0.0.1'); // 2
    expect(limiter.allow('127.0.0.1')).toBe(false); // 3rd — blocked
  });

  it('resets the window after windowMs has elapsed', () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 60000 });
    limiter.allow('127.0.0.1');
    limiter.allow('127.0.0.1');
    expect(limiter.allow('127.0.0.1')).toBe(false);

    // Advance past the window
    vi.advanceTimersByTime(60_001);
    expect(limiter.allow('127.0.0.1')).toBe(true);
  });

  it('tracks different IPs independently', () => {
    const limiter = new RateLimiter({ maxRequests: 1, windowMs: 60000 });
    expect(limiter.allow('10.0.0.1')).toBe(true);
    expect(limiter.allow('10.0.0.2')).toBe(true);
    expect(limiter.allow('10.0.0.1')).toBe(false);
    expect(limiter.allow('10.0.0.2')).toBe(false);
  });

  it('reports remaining capacity correctly', () => {
    const limiter = new RateLimiter({ maxRequests: 3, windowMs: 60000 });
    expect(limiter.remaining('127.0.0.1')).toBe(3);
    limiter.allow('127.0.0.1');
    expect(limiter.remaining('127.0.0.1')).toBe(2);
    limiter.allow('127.0.0.1');
    limiter.allow('127.0.0.1');
    expect(limiter.remaining('127.0.0.1')).toBe(0);
  });

  it('returns full capacity for an unknown key', () => {
    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 60000 });
    expect(limiter.remaining('unknown')).toBe(5);
  });

  it('reports resetAt timestamp', () => {
    const limiter = new RateLimiter({ windowMs: 60000 });
    const now = Date.now();
    limiter.allow('127.0.0.1');
    const resetAt = limiter.resetAt('127.0.0.1');

    // resetAt should be roughly now + 60000
    expect(resetAt).toBeGreaterThan(now);
    expect(resetAt).toBeLessThanOrEqual(now + 60000 + 10); // small clock tolerance
  });

  it('uses default config when none provided', () => {
    const limiter = new RateLimiter();
    expect(limiter.config.maxRequests).toBe(5);
    expect(limiter.config.windowMs).toBe(10 * 60 * 1000);
  });
});

describe('extractClientIp', () => {
  const originalTrustProxy = process.env.TRUST_PROXY_HEADERS;

  function makeRequest(headers: Record<string, string>): Request {
    return new Request('https://example.com/api', { headers });
  }

  beforeEach(() => {
    delete process.env.TRUST_PROXY_HEADERS;
  });

  afterAll(() => {
    if (originalTrustProxy !== undefined) {
      process.env.TRUST_PROXY_HEADERS = originalTrustProxy;
    } else {
      delete process.env.TRUST_PROXY_HEADERS;
    }
  });

  it('uses Astro clientAddress when provided (safest default)', () => {
    const req = makeRequest({ 'x-forwarded-for': '203.0.113.1' });
    expect(extractClientIp(req, '10.0.0.99')).toBe('10.0.0.99');
  });

  it('ignores x-forwarded-for when TRUST_PROXY_HEADERS is not set', () => {
    const req = makeRequest({ 'x-forwarded-for': '203.0.113.1, 10.0.0.1' });
    // Without TRUST_PROXY_HEADERS, forwarded headers are ignored.
    expect(extractClientIp(req)).toBe('unknown');
  });

  it('ignores x-real-ip when TRUST_PROXY_HEADERS is not set', () => {
    const req = makeRequest({ 'x-real-ip': '198.51.100.5' });
    expect(extractClientIp(req)).toBe('unknown');
  });

  it('uses x-forwarded-for when TRUST_PROXY_HEADERS=true', () => {
    process.env.TRUST_PROXY_HEADERS = 'true';
    const req = makeRequest({ 'x-forwarded-for': '203.0.113.1, 10.0.0.1' });
    expect(extractClientIp(req)).toBe('203.0.113.1');
  });

  it('uses x-real-ip when TRUST_PROXY_HEADERS=true and x-forwarded-for missing', () => {
    process.env.TRUST_PROXY_HEADERS = 'true';
    const req = makeRequest({ 'x-real-ip': '198.51.100.5' });
    expect(extractClientIp(req)).toBe('198.51.100.5');
  });

  it('prefers x-forwarded-for over x-real-ip when both present and trusted', () => {
    process.env.TRUST_PROXY_HEADERS = 'true';
    const req = makeRequest({
      'x-forwarded-for': '203.0.113.9',
      'x-real-ip': '10.0.0.1',
    });
    expect(extractClientIp(req)).toBe('203.0.113.9');
  });

  it('uses cf-connecting-ip without proxy opt-in (Cloudflare edge header)', () => {
    const req = makeRequest({ 'cf-connecting-ip': '172.16.0.1' });
    expect(extractClientIp(req)).toBe('172.16.0.1');
  });

  it('returns "unknown" when no headers are set and no clientAddress', () => {
    const req = makeRequest({});
    expect(extractClientIp(req)).toBe('unknown');
  });

  it('trims whitespace from header values', () => {
    process.env.TRUST_PROXY_HEADERS = 'true';
    const req = makeRequest({ 'x-real-ip': '  203.0.113.42  ' });
    expect(extractClientIp(req)).toBe('203.0.113.42');
  });

  it('clientAddress takes priority over all other sources', () => {
    process.env.TRUST_PROXY_HEADERS = 'true';
    const req = makeRequest({
      'x-forwarded-for': 'evil.1',
      'x-real-ip': 'evil.2',
      'cf-connecting-ip': 'evil.3',
    });
    expect(extractClientIp(req, 'safe-client')).toBe('safe-client');
  });
});

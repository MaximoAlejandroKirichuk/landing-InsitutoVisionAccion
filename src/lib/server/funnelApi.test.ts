import { describe, expect, it, vi, beforeEach } from 'vitest';

/* ------------------------------------------------------------------ */
/*  Hoisted mocks — must run before imports (which trigger `new`).    */
/* ------------------------------------------------------------------ */
const {
  mockAppendToSheet,
  mockAllow,
  mockExtractClientIp,
} = vi.hoisted(() => ({
  mockAppendToSheet: vi.fn(),
  mockAllow: vi.fn(),
  mockExtractClientIp: vi.fn(),
}));

/* ------------------------------------------------------------------ */
/*  Mock Google Sheets so we never pull in googleapis during tests.    */
/* ------------------------------------------------------------------ */

vi.mock('./googleSheets', () => ({
  appendFunnelSubmissionToSheet: (...args: unknown[]) =>
    mockAppendToSheet(...args),
}));

/* ------------------------------------------------------------------ */
/*  We want the real funnelSubmission helpers but control rate limits. */
/* ------------------------------------------------------------------ */

vi.mock('./rateLimiter', () => {
  function MockRateLimiter(this: { allow: typeof mockAllow; config: { maxRequests: number; windowMs: number } }) {
    this.allow = mockAllow;
    this.config = { maxRequests: 5, windowMs: 600_000 };
  }

  return {
    RateLimiter: MockRateLimiter,
    extractClientIp: (...args: unknown[]) =>
      mockExtractClientIp(...args),
  };
});

import type { APIContext } from 'astro';
import { POST } from '../../pages/api/funnel-submissions';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Build a minimal APIContext that satisfies the handler's needs. */
function mockContext(overrides: Partial<Pick<APIContext, 'request' | 'clientAddress'>>): APIContext {
  return overrides as unknown as APIContext;
}

function buildRequest(body: unknown): Request {
  return new Request('https://example.com/api/funnel-submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeValidPayload() {
  return {
    academySlug: 'test-academy',
    funnelSlug: 'test-funnel',
    contact: {
      fullName: 'Test User',
      whatsapp: '549111234567',
      email: 'test@example.com',
      consent: true,
    },
    answers: [
      { questionId: 'q1', type: 'single' as const, selected: ['a'] },
      { questionId: 'q2', type: 'single' as const, selected: ['b'] },
      { questionId: 'q3', type: 'multi' as const, selected: ['c'] },
      { questionId: 'q4', type: 'multi' as const, selected: ['d'] },
      { questionId: 'q5', type: 'single' as const, selected: ['e'] },
    ],
    metadata: {
      submittedAt: '2026-01-01T00:00:00.000Z',
      userAgent: 'Vitest',
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                             */
/* ------------------------------------------------------------------ */

describe('POST /api/funnel-submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Safe defaults for every test — override per test as needed.
    mockAllow.mockReturnValue(true);
    mockExtractClientIp.mockReturnValue('127.0.0.1');
    mockAppendToSheet.mockResolvedValue(undefined);
  });

  /* ---- 400: invalid JSON ---------------------------------------- */

  it('returns 400 when the request body is not valid JSON', async () => {
    const request = new Request('https://example.com/api/funnel-submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });

    const response = await POST(mockContext({ request, clientAddress: '127.0.0.1' }));
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toContain('Invalid JSON');
  });

  /* ---- 400: invalid payload (exercises validateFunnelSubmissionPayload) */

  it('returns 400 for a payload missing required fields', async () => {
    const response = await POST(
      mockContext({ request: buildRequest({ invalid: true }), clientAddress: '127.0.0.1' }),
    );
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Invalid submission payload.');
  });

  /* ---- 429: rate-limited ---------------------------------------- */

  it('returns 429 when the rate limiter blocks the request', async () => {
    mockAllow.mockReturnValue(false);

    const response = await POST(
      mockContext({ request: buildRequest(makeValidPayload()), clientAddress: '127.0.0.1' }),
    );
    expect(response.status).toBe(429);

    const body = await response.json();
    expect(body.error).toContain('Demasiados intentos');
  });

  /* ---- 200: happy path (mocked Google Sheets) ------------------- */

  it('returns 200 with a submissionId on success', async () => {
    const response = await POST(
      mockContext({ request: buildRequest(makeValidPayload()), clientAddress: '127.0.0.1' }),
    );
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('submissionId');
    expect(typeof body.submissionId).toBe('string');

    // Verify the Google Sheets mock was actually called.
    expect(mockAppendToSheet).toHaveBeenCalledOnce();
  });

  /* ---- 400: empty answers --------------------------------------- */

  it('returns 400 when answers array is empty', async () => {
    const payload = { ...makeValidPayload(), answers: [] };
    const response = await POST(
      mockContext({ request: buildRequest(payload), clientAddress: '127.0.0.1' }),
    );
    expect(response.status).toBe(400);
  });

  /* ---- 400: consent not given ----------------------------------- */

  it('returns 400 when consent is false', async () => {
    const payload = makeValidPayload();
    payload.contact.consent = false;

    const response = await POST(
      mockContext({ request: buildRequest(payload), clientAddress: '127.0.0.1' }),
    );
    expect(response.status).toBe(400);
  });

  /* ---- IP extraction integration --------------------------------- */

  it('passes clientAddress to extractClientIp', async () => {
    // Reset to use the real extractClientIp.
    mockExtractClientIp.mockImplementation(
      (await vi.importActual<typeof import('./rateLimiter')>('./rateLimiter')).extractClientIp,
    );

    const response = await POST(
      mockContext({ request: buildRequest(makeValidPayload()), clientAddress: '10.0.0.42' }),
    );
    expect(response.status).toBe(200);
    // If we got here without mocking, the real extractClientIp handled it.
  });
});

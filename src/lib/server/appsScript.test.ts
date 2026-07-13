import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { FunnelSubmission } from '../funnelState';
import {
  validateAppsScriptConfig,
  postSubmissionToAppsScript,
  AppsScriptConfigError,
} from './appsScript';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeSubmission(overrides: Partial<FunnelSubmission> = {}): FunnelSubmission {
  return {
    academySlug: 'instituto-vision-accion',
    funnelSlug: 'via-orientation',
    contact: {
      fullName: 'Ana García',
      whatsapp: '54911234567',
      email: 'ana@example.com',
      consent: true,
    },
    answers: [
      { questionId: 'q1', type: 'single', selected: ['relaciones'], otherText: '' },
      { questionId: 'q2', type: 'single', selected: ['claridad'] },
      { questionId: 'q3', type: 'multi', selected: ['coaching', 'cursos'] },
      { questionId: 'q4', type: 'multi', selected: ['online'] },
      { questionId: 'q5', type: 'single', selected: ['inicio'], otherText: '' },
    ],
    metadata: {
      submittedAt: '2026-07-13T12:34:56.000Z',
      userAgent: 'Vitest',
      referrer: 'https://example.com/landing',
    },
    ...overrides,
  };
}

const baseEnv = {
  GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/ABC123/exec',
};

beforeEach(() => {
  vi.clearAllMocks();
});

/* ── validateAppsScriptConfig ────────────── */

describe('validateAppsScriptConfig()', () => {
  it('accepts a valid HTTPS URL with no secret', () => {
    const result = validateAppsScriptConfig({
      GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/ABC123/exec',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.url).toBe('https://script.google.com/macros/s/ABC123/exec');
      expect(result.config.secret).toBeUndefined();
    }
  });

  it('accepts a valid HTTPS URL with a secret', () => {
    const result = validateAppsScriptConfig({
      GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/ABC123/exec',
      GOOGLE_APPS_SCRIPT_SECRET: 'my-secret',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.secret).toBe('my-secret');
    }
  });

  it('rejects missing URL', () => {
    const result = validateAppsScriptConfig({});

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('not configured');
    }
  });

  it('rejects empty URL string', () => {
    const result = validateAppsScriptConfig({
      GOOGLE_APPS_SCRIPT_URL: '   ',
    });

    expect(result.ok).toBe(false);
  });

  it('rejects non-HTTPS URL', () => {
    const result = validateAppsScriptConfig({
      GOOGLE_APPS_SCRIPT_URL: 'http://script.google.com/macros/s/ABC123/exec',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('HTTPS');
    }
  });

  it('rejects malformed URL', () => {
    const result = validateAppsScriptConfig({
      GOOGLE_APPS_SCRIPT_URL: 'not-a-valid-url',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('malformed');
    }
  });
});

/* ── AppsScriptConfigError ───────────────── */

describe('AppsScriptConfigError', () => {
  it('has the correct name and message', () => {
    const err = new AppsScriptConfigError('test message');
    expect(err.name).toBe('AppsScriptConfigError');
    expect(err.message).toBe('test message');
  });

  it('has a default message', () => {
    const err = new AppsScriptConfigError();
    expect(err.message).toContain('not configured');
  });
});

/* ── postSubmissionToAppsScript ──────────── */

describe('postSubmissionToAppsScript()', () => {
  /* ── Happy path ─────────────────────────── */

  it('posts the sanitized row to the Apps Script URL and returns ok when body has success:true', async () => {
    mockFetch.mockResolvedValue(new Response('{"success":true}', { status: 200 }));

    const result = await postSubmissionToAppsScript(makeSubmission(), 'sub-1', baseEnv);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.status).toBe(200);
    }

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('https://script.google.com/macros/s/ABC123/exec');
    expect(init.method).toBe('POST');

    const body = JSON.parse(init.body);
    expect(body.submissionId).toBe('sub-1');
    expect(body.row).toBeInstanceOf(Array);
    expect(body.row[0]).toBe('sub-1'); // submissionId is first cell
    expect(body.secret).toBeUndefined();
  });

  it('includes the secret in the body when configured', async () => {
    mockFetch.mockResolvedValue(new Response('{"success":true}', { status: 200 }));

    const env = {
      ...baseEnv,
      GOOGLE_APPS_SCRIPT_SECRET: 'my-shared-secret',
    };

    const result = await postSubmissionToAppsScript(makeSubmission(), 'sub-2', env);

    expect(result.ok).toBe(true);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.secret).toBe('my-shared-secret');
  });

  it('does NOT send the secret as a custom request header', async () => {
    mockFetch.mockResolvedValue(new Response('{"success":true}', { status: 200 }));

    const env = {
      ...baseEnv,
      GOOGLE_APPS_SCRIPT_SECRET: 'my-shared-secret',
    };

    await postSubmissionToAppsScript(makeSubmission(), 'sub-header', env);

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers['X-App-Script-Secret']).toBeUndefined();
  });

  /* ── Body-level failures (HTTP 200 + error JSON) ───── */

  it('returns ok:false when Apps Script returns success:false with an error message', async () => {
    mockFetch.mockResolvedValue(
      new Response('{"success":false,"error":"Forbidden"}', { status: 200 }),
    );

    const result = await postSubmissionToAppsScript(makeSubmission(), 'sub-fail', baseEnv);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Apps Script reported failure');
      expect(result.error).toContain('Forbidden');
      expect(result.status).toBe(200);
    }
  });

  it('returns ok:false when Apps Script returns success:false without an error field', async () => {
    mockFetch.mockResolvedValue(
      new Response('{"success":false}', { status: 200 }),
    );

    const result = await postSubmissionToAppsScript(makeSubmission(), 'sub-no-error', baseEnv);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Apps Script reported failure');
      expect(result.error).toContain('Unknown error');
    }
  });

  it('returns ok:false when Apps Script response body is not valid JSON', async () => {
    mockFetch.mockResolvedValue(new Response('not json at all', { status: 200 }));

    const result = await postSubmissionToAppsScript(makeSubmission(), 'sub-bad-json', baseEnv);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('not valid JSON');
    }
  });

  it('returns ok:false when Apps Script response body is missing the success field', async () => {
    mockFetch.mockResolvedValue(new Response('{}', { status: 200 }));

    const result = await postSubmissionToAppsScript(makeSubmission(), 'sub-no-success', baseEnv);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('missing success field');
    }
  });

  it('returns ok:false when success field is a truthy non-boolean (string)', async () => {
    mockFetch.mockResolvedValue(new Response('{"success":"true"}', { status: 200 }));

    const result = await postSubmissionToAppsScript(makeSubmission(), 'sub-string', baseEnv);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      // "true" (string) !== true (strict), so it falls into the success:false branch.
      expect(result.error).toContain('Apps Script reported failure');
      expect(result.error).toContain('Unknown error');
    }
  });

  /* ── HTTP non-2xx ────────────────────────── */

  it('returns ok:false for a non-2xx response', async () => {
    mockFetch.mockResolvedValue(new Response('Internal Error', { status: 500 }));

    const result = await postSubmissionToAppsScript(makeSubmission(), 'sub-3', baseEnv);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('HTTP 500');
      expect(result.status).toBe(500);
    }
  });

  it('returns ok:false when the URL is not configured', async () => {
    const result = await postSubmissionToAppsScript(makeSubmission(), 'sub-4', {});

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('not configured');
    }
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns ok:false on network fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await postSubmissionToAppsScript(makeSubmission(), 'sub-5', baseEnv);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Network error');
    }
  });

  it('returns ok:false for a 403 Forbidden from Apps Script (unusual non-2xx)', async () => {
    mockFetch.mockResolvedValue(new Response('Forbidden', { status: 403 }));

    const result = await postSubmissionToAppsScript(makeSubmission(), 'sub-6', baseEnv);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('HTTP 403');
    }
  });

  /* ── Timeout / abort ────────────────────── */

  it('returns ok:false on AbortError (timeout)', async () => {
    const abortError = new Error('The operation was aborted.');
    abortError.name = 'AbortError';
    mockFetch.mockRejectedValue(abortError);

    const result = await postSubmissionToAppsScript(makeSubmission(), 'sub-timeout', baseEnv);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('timed out');
    }
  });

  it('returns ok:false on TimeoutError', async () => {
    const timeoutError = new Error('The operation timed out.');
    timeoutError.name = 'TimeoutError';
    mockFetch.mockRejectedValue(timeoutError);

    const result = await postSubmissionToAppsScript(makeSubmission(), 'sub-timeout2', baseEnv);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('timed out');
    }
  });

  /* ── AbortSignal included in fetch call ─── */

  it('passes an AbortSignal to fetch', async () => {
    mockFetch.mockResolvedValue(new Response('{"success":true}', { status: 200 }));

    await postSubmissionToAppsScript(makeSubmission(), 'sub-signal', baseEnv);

    const [, init] = mockFetch.mock.calls[0];
    expect(init.signal).toBeDefined();
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });
});

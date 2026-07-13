/**
 * Server-side Google Apps Script webhook writer for funnel submissions.
 *
 * Replaces the previous googleapis/service-account approach. The server
 * POSTs a sanitized row array to a Google Apps Script Web App URL, and
 * the Apps Script `doPost(e)` handler appends the row to the sheet.
 *
 * Apps Script cannot read custom HTTP headers, so the shared secret is sent
 * exclusively in the JSON body. The Apps Script `doPost(e)` snippet validates
 * the body `secret` field and returns `{ success: true }` on success or
 * `{ success: false, error: "..." }` on any failure (forbidden, missing sheet,
 * catch block, etc.).  The server parses the JSON response and only considers
 * the operation successful when `success === true`.
 */

import type { FunnelSubmission } from '../funnelState';
import {
  buildFunnelSubmissionRow,
} from './funnelSubmission';

/* ── Types ────────────────────────────────── */

export interface AppsScriptConfigInput {
  GOOGLE_APPS_SCRIPT_URL?: string;
  GOOGLE_APPS_SCRIPT_SECRET?: string;
}

export interface AppsScriptConfig {
  url: string;
  secret?: string;
}

export interface AppsScriptConfigValidationResult {
  ok: true;
  config: AppsScriptConfig;
}

export interface InvalidAppsScriptConfigResult {
  ok: false;
  error: string;
}

export type AppsScriptConfigResult =
  | AppsScriptConfigValidationResult
  | InvalidAppsScriptConfigResult;

/* ── Error class ──────────────────────────── */

export class AppsScriptConfigError extends Error {
  constructor(message = 'Apps Script integration is not configured.') {
    super(message);
    this.name = 'AppsScriptConfigError';
  }
}

/* ── Config validation ────────────────────── */

export function validateAppsScriptConfig(
  env: AppsScriptConfigInput,
): AppsScriptConfigResult {
  const url = env.GOOGLE_APPS_SCRIPT_URL?.trim() ?? '';
  const secret = env.GOOGLE_APPS_SCRIPT_SECRET?.trim() || undefined;

  if (!url) {
    return {
      ok: false,
      error: 'Apps Script integration is not configured.',
    };
  }

  // Basic URL format check.
  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith('https')) {
      return {
        ok: false,
        error: 'Apps Script URL must use HTTPS.',
      };
    }
  } catch {
    return {
      ok: false,
      error: 'Apps Script URL is malformed.',
    };
  }

  return {
    ok: true,
    config: { url, secret },
  };
}

/* ── Webhook post ─────────────────────────── */

interface PostToAppsScriptResult {
  ok: true;
  status: number;
}

interface PostToAppsScriptError {
  ok: false;
  error: string;
  status?: number;
}

export type PostToAppsScriptOutcome =
  | PostToAppsScriptResult
  | PostToAppsScriptError;

/** Timeout for the Google Apps Script fetch request (10 seconds). */
const APPS_SCRIPT_TIMEOUT_MS = 10_000;

/**
 * Posts a sanitized row array to the Google Apps Script webhook.
 *
 * The server sends a structured JSON payload:
 * ```json
 * {
 *   "submissionId": "uuid",
 *   "row": ["cell1", "cell2", ...]
 * }
 * ```
 *
 * The Apps Script `doPost(e)` handler parses `e.postData.contents`,
 * validates the shared secret from the body, and calls
 * `Sheet.appendRow(rowContents)`.
 *
 * **Response validation**: Apps Script always returns HTTP 200 (even for
 * errors caught inside `doPost`), so we parse the JSON body and require
 * `{ success: true }`.  Any other JSON shape, parse failure, or
 * `success: false` is treated as a server-side failure.
 */
export async function postSubmissionToAppsScript(
  submission: FunnelSubmission,
  submissionId: string,
  env: Record<string, string | undefined> = process.env,
): Promise<PostToAppsScriptOutcome> {
  const configResult = validateAppsScriptConfig({
    GOOGLE_APPS_SCRIPT_URL: env.GOOGLE_APPS_SCRIPT_URL,
    GOOGLE_APPS_SCRIPT_SECRET: env.GOOGLE_APPS_SCRIPT_SECRET,
  });

  if (!configResult.ok) {
    return { ok: false, error: configResult.error };
  }

  const { url, secret } = configResult.config;
  const row = buildFunnelSubmissionRow(submission, submissionId);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
  };

  const body: Record<string, unknown> = { submissionId, row };
  if (secret) {
    body.secret = secret;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(APPS_SCRIPT_TIMEOUT_MS),
    });
  } catch (err: unknown) {
    if (isAbortError(err)) {
      return {
        ok: false,
        error: `Apps Script request timed out after ${APPS_SCRIPT_TIMEOUT_MS / 1000}s.`,
      };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // Apps Script always returns HTTP 200 for Web App requests (even when
  // doPost throws or returns an error JSON).  We MUST parse the body.
  if (!response.ok) {
    // Non-2xx is unusual for Apps Script Web Apps, but handle it just in case.
    return {
      ok: false,
      error: `Apps Script returned HTTP ${response.status}`,
      status: response.status,
    };
  }

  // Parse the JSON body and validate success.
  let responseBody: unknown;
  try {
    responseBody = await response.json();
  } catch {
    return {
      ok: false,
      error: 'Apps Script response body is not valid JSON.',
      status: response.status,
    };
  }

  if (
    typeof responseBody !== 'object' ||
    responseBody === null ||
    !('success' in responseBody)
  ) {
    return {
      ok: false,
      error: 'Apps Script response body missing success field.',
      status: response.status,
    };
  }

  const bodyParsed = responseBody as { success: unknown; error?: unknown };

  if (bodyParsed.success !== true) {
    const bodyError =
      typeof bodyParsed.error === 'string' && bodyParsed.error.length > 0
        ? bodyParsed.error
        : 'Unknown error';
    return {
      ok: false,
      error: `Apps Script reported failure: ${bodyError}`,
      status: response.status,
    };
  }

  return { ok: true, status: response.status };
}

/* ── Helpers ──────────────────────────────── */

/** Checks whether an error is an abort/timeout error. */
function isAbortError(err: unknown): boolean {
  return (
    err instanceof Error &&
    (err.name === 'AbortError' || err.name === 'TimeoutError')
  );
}

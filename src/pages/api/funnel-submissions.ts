import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import { appendFunnelSubmissionToSheet } from '../../lib/server/googleSheets';
import {
  GoogleSheetsConfigError,
  validateFunnelSubmissionPayload,
} from '../../lib/server/funnelSubmission';
import { RateLimiter, extractClientIp } from '../../lib/server/rateLimiter';

export const prerender = false;

/** Shared across requests within a single Node process. */
const rateLimiter = new RateLimiter();

function jsonResponse(status: number, body: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  /* ── Rate limiting ─────────────────────── */
  const clientIp = extractClientIp(request, clientAddress);

  if (!rateLimiter.allow(clientIp)) {
    return jsonResponse(429, {
      error: 'Demasiados intentos. Esperá unos minutos y volvé a intentarlo.',
    });
  }

  /* ── Payload parsing & validation ─────── */
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON payload.' });
  }

  const payloadResult = validateFunnelSubmissionPayload(body);

  if (!payloadResult.ok) {
    return jsonResponse(400, { error: payloadResult.error });
  }

  const submissionId = randomUUID();

  /* ── Persist ──────────────────────────── */
  try {
    await appendFunnelSubmissionToSheet(payloadResult.submission, submissionId);
    return jsonResponse(200, { submissionId });
  } catch (error) {
    // Log the real cause server-side so we can diagnose.
    console.error(
      '[funnel-submissions] Failed to persist submission %s: %s',
      submissionId,
      error instanceof Error ? error.message : String(error),
    );

    if (error instanceof GoogleSheetsConfigError) {
      // Configuration-specific: log it clearly but don't leak config details to the client.
      console.error(
        '[funnel-submissions] Google Sheets config error: %s',
        error.message,
      );
    }

    // Always return a generic failure to the caller.
    return jsonResponse(500, { error: 'Unable to save submission.' });
  }
};

import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import { postSubmissionToAppsScript } from '../../lib/server/appsScript';
import { validateFormationLeadPayload } from '../../lib/server/formationLead';
import { RateLimiter, extractClientIp } from '../../lib/server/rateLimiter';

export const prerender = false;

const rateLimiter = new RateLimiter();

function jsonResponse(status: number, body: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const clientIp = extractClientIp(request, clientAddress);
  if (!rateLimiter.allow(clientIp)) {
    return jsonResponse(429, {
      error: 'Demasiados intentos. Esperá unos minutos y volvé a intentarlo.',
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON payload.' });
  }

  const result = validateFormationLeadPayload(body, {
    userAgent: request.headers.get('user-agent') ?? '',
    referrer: request.headers.get('referer') ?? undefined,
  });
  if (!result.ok) {
    return jsonResponse(400, { error: result.error });
  }

  const submissionId = randomUUID();
  // Build-time values win; otherwise read the runtime environment (Netlify functions expose it on process.env).
  const env = {
    GOOGLE_APPS_SCRIPT_URL: import.meta.env.GOOGLE_APPS_SCRIPT_URL ?? process.env.GOOGLE_APPS_SCRIPT_URL,
    GOOGLE_APPS_SCRIPT_SECRET: import.meta.env.GOOGLE_APPS_SCRIPT_SECRET ?? process.env.GOOGLE_APPS_SCRIPT_SECRET,
  };

  const persisted = await postSubmissionToAppsScript(result.submission, submissionId, env);
  if (persisted.ok) {
    return jsonResponse(200, { submissionId });
  }

  console.error('[formation-leads] Failed to persist lead %s: %s', submissionId, persisted.error);
  return jsonResponse(500, { error: 'Unable to save lead.' });
};

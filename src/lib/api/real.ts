/**
 * VIA Orientation Funnel — Real submission adapter.
 * POSTs the FunnelSubmission payload to PUBLIC_FUNNEL_API_URL.
 * Uses a 10-second AbortController timeout.
 * All error paths resolve through the promise — never throws.
 */

import type { FunnelSubmission, SubmissionResult } from './types';

export async function submitFunnelReal(
  payload: FunnelSubmission,
): Promise<SubmissionResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const url = import.meta.env.PUBLIC_FUNNEL_API_URL as string;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        ok: false,
        error: `Error del servidor (${response.status}). Por favor, intentá nuevamente.`,
      };
    }

    const data: { submissionId?: string } = await response.json();
    return {
      ok: true,
      submissionId: data.submissionId ?? `real-${Date.now()}`,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        ok: false,
        error:
          'La solicitud tardó demasiado. Verificá tu conexión e intentá de nuevo.',
      };
    }

    return {
      ok: false,
      error:
        'No pudimos enviar tu información. Verificá tu conexión e intentá de nuevo.',
    };
  }
}

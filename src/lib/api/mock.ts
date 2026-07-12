/**
 * VIA Orientation Funnel — Mock submission adapter.
 * Simulates a 600 ms delay, logs the full payload to console,
 * and returns { ok: true, submissionId: 'mock-<timestamp>' }.
 * Makes no network requests.
 */

import type { FunnelSubmission, SubmissionResult } from './types';

export async function submitFunnelMock(
  payload: FunnelSubmission,
): Promise<SubmissionResult> {
  console.log('[mock] FunnelSubmission payload:', payload);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        submissionId: `mock-${Date.now()}`,
      });
    }, 600);
  });
}

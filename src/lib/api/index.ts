/**
 * VIA Orientation Funnel — Adapter entry point.
 * Selects the mock or real implementation based on whether
 * PUBLIC_FUNNEL_API_URL is set. UI code imports only this module.
 */

import type { FunnelSubmission, SubmissionResult } from './types';
import { submitFunnelMock } from './mock';
import { submitFunnelReal } from './real';

/**
 * Active submission adapter.
 * When `PUBLIC_FUNNEL_API_URL` is set → real adapter (POST to URL).
 * When absent → mock adapter (600 ms delay, console log, no network).
 */
export const submitFunnel: (
  payload: FunnelSubmission,
) => Promise<SubmissionResult> =
  typeof import.meta.env.PUBLIC_FUNNEL_API_URL === 'string' &&
  (import.meta.env.PUBLIC_FUNNEL_API_URL as string).length > 0
    ? submitFunnelReal
    : submitFunnelMock;

export type { FunnelSubmission, SubmissionResult };

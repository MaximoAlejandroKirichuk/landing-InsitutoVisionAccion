/**
 * VIA Orientation Funnel — Adapter entry point.
 * Exposes the real submission adapter. The adapter itself falls back to the
 * local on-demand endpoint unless PUBLIC_FUNNEL_API_URL overrides it.
 */

import type { FunnelSubmission, SubmissionResult } from './types';
import { submitFunnelReal } from './real';

/**
 * Active submission adapter.
 * Always uses the real adapter so production keeps posting to the local API
 * endpoint by default.
 */
export const submitFunnel: (
  payload: FunnelSubmission,
) => Promise<SubmissionResult> =
  submitFunnelReal;

export type { FunnelSubmission, SubmissionResult };

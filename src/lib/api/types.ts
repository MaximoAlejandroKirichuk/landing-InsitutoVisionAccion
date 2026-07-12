/**
 * VIA Orientation Funnel — Submission adapter types.
 * Frontend-owned contract: no internal SaaS coupling.
 * Imported by mock, real, and index adapter modules.
 */

import type { FunnelSubmission, SubmissionResult } from '../funnelState';

/** Adapter contract: (payload) => Promise<{ ok, submissionId?, error? }> */
export type SubmitFunnel = (payload: FunnelSubmission) => Promise<SubmissionResult>;

/** Re-exported for adapter consumers that prefer a single import. */
export type { FunnelSubmission, SubmissionResult };

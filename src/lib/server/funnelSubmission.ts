/**
 * Server-side helpers for the academy funnel submission.
 * Pure utilities are kept here so they can be tested without calling Google.
 */

import type { FunnelSubmission } from '../funnelState';
import { QUIZ_QUESTIONS } from '../quizData';

export interface GoogleSheetsConfigInput {
  GOOGLE_SHEET_ID?: string;
  GOOGLE_SERVICE_ACCOUNT_EMAIL?: string;
  GOOGLE_PRIVATE_KEY?: string;
  GOOGLE_SHEET_RANGE?: string;
}

export interface GoogleSheetsConfig {
  sheetId: string;
  serviceAccountEmail: string;
  privateKey: string;
  range: string;
}

export interface ValidateFunnelSubmissionResult {
  ok: true;
  submission: FunnelSubmission;
}

export interface InvalidFunnelSubmissionResult {
  ok: false;
  error: string;
}

export type FunnelSubmissionValidationResult =
  | ValidateFunnelSubmissionResult
  | InvalidFunnelSubmissionResult;

export interface GoogleSheetsConfigValidationResult {
  ok: true;
  config: GoogleSheetsConfig;
}

export interface InvalidGoogleSheetsConfigResult {
  ok: false;
  error: string;
}

export type GoogleSheetsConfigResult =
  | GoogleSheetsConfigValidationResult
  | InvalidGoogleSheetsConfigResult;

const DEFAULT_RANGE = 'Leads!A:Z';
const QUESTION_ORDER = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;

/** Canonical question IDs from the quiz data, for server-side completeness checks. */
const CANONICAL_QUESTION_IDS = new Set(QUIZ_QUESTIONS.map((q) => q.id));

export class GoogleSheetsConfigError extends Error {
  constructor(message = 'Google Sheets integration is not configured.') {
    super(message);
    this.name = 'GoogleSheetsConfigError';
  }
}

/**
 * Replaces escaped-newline notation with real newlines.
 * Environment variables often store `\n` as literal backslash-n.
 */
export function normalizeGooglePrivateKey(privateKey: string): string {
  return privateKey.trim().replace(/\\n/g, '\n');
}

/**
 * Tests whether a private key string is a well-formed PEM key.
 * Expects an already-normalized key (call `normalizeGooglePrivateKey` first).
 */
export function validateGooglePrivateKey(privateKey: string): boolean {
  return (
    privateKey.includes('-----BEGIN PRIVATE KEY-----') &&
    privateKey.includes('-----END PRIVATE KEY-----')
  );
}

export function validateGoogleSheetsConfig(
  env: GoogleSheetsConfigInput,
): GoogleSheetsConfigResult {
  const sheetId = env.GOOGLE_SHEET_ID?.trim() ?? '';
  const serviceAccountEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ?? '';
  const privateKeyRaw = env.GOOGLE_PRIVATE_KEY?.trim() ?? '';
  const range = env.GOOGLE_SHEET_RANGE?.trim() || DEFAULT_RANGE;

  if (!sheetId || !serviceAccountEmail || !privateKeyRaw) {
    return {
      ok: false,
      error: 'Google Sheets integration is not configured.',
    };
  }

  const privateKey = normalizeGooglePrivateKey(privateKeyRaw);

  if (!validateGooglePrivateKey(privateKey)) {
    return {
      ok: false,
      error: 'Google Sheets private key is invalid.',
    };
  }

  return {
    ok: true,
    config: {
      sheetId,
      serviceAccountEmail,
      privateKey,
      range,
    },
  };
}

export function validateFunnelSubmissionPayload(
  payload: unknown,
): FunnelSubmissionValidationResult {
  if (!isRecord(payload)) {
    return invalidSubmission();
  }

  if (!isString(payload.academySlug) || !isString(payload.funnelSlug)) {
    return invalidSubmission();
  }

  if (!isContact(payload.contact)) {
    return invalidSubmission();
  }

  if (!Array.isArray(payload.answers) || payload.answers.length === 0) {
    return invalidSubmission();
  }

  if (!payload.answers.every(isAnswer)) {
    return invalidSubmission();
  }

  // Ensure every canonical question is present with at least one selection.
  const answeredIds = new Set(
    (payload.answers as Array<{ questionId: string }>).map((a) => a.questionId),
  );
  for (const expectedId of CANONICAL_QUESTION_IDS) {
    if (!answeredIds.has(expectedId)) {
      return invalidSubmission();
    }
  }

  // Reject extra/unexpected question ids to keep the payload tight.
  for (const id of answeredIds) {
    if (!CANONICAL_QUESTION_IDS.has(id)) {
      return invalidSubmission();
    }
  }

  if (!isMetadata(payload.metadata)) {
    return invalidSubmission();
  }

  return {
    ok: true,
    submission: payload as unknown as FunnelSubmission,
  };
}

/**
 * Sanitizes a cell value for Google Sheets formula injection prevention.
 * Prefixes values starting with `=`, `+`, `-`, or `@` with a single quote
 * so Google Sheets treats them as plain text.
 */
export function sanitizeSheetCell(value: string): string {
  // Use trimStart() so leading whitespace before a formula marker is caught too.
  // Google Sheets ignores leading whitespace before interpreting a formula,
  // so `  =SUM(A1)` is just as dangerous as `=SUM(A1)`.
  if (value.length > 0 && /^[=+\-@]/.test(value.trimStart())) {
    return `'${value}`;
  }
  return value;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function buildFunnelSubmissionRow(
  submission: FunnelSubmission,
  submissionId: string,
): string[] {
  const answersByQuestionId = new Map(
    submission.answers.map((answer) => [answer.questionId, answer]),
  );

  const row: string[] = [
    submissionId,
    submission.metadata.submittedAt ?? '',
    submission.academySlug,
    submission.funnelSlug,
    sanitizeSheetCell(submission.contact.fullName),
    sanitizeSheetCell(submission.contact.whatsapp),
    sanitizeSheetCell(submission.contact.email),
    submission.contact.consent ? 'true' : 'false',
    sanitizeSheetCell(submission.metadata.userAgent),
    sanitizeSheetCell(submission.metadata.referrer ?? ''),
  ];

  for (const questionId of QUESTION_ORDER) {
    const answer = answersByQuestionId.get(questionId);
    row.push(
      answer
        ? answer.selected.map(sanitizeSheetCell).join(', ')
        : '',
    );
    row.push(sanitizeSheetCell(answer?.otherText?.trim() ?? ''));
  }

  return row;
}

function invalidSubmission(): InvalidFunnelSubmissionResult {
  return {
    ok: false,
    error: 'Invalid submission payload.',
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isContact(value: unknown): boolean {
  if (!isRecord(value)) return false;

  if (!isString(value.fullName) || !value.fullName.trim()) return false;
  if (!isString(value.whatsapp) || !value.whatsapp.trim()) return false;
  if (!isString(value.email)) return false;
  if (value.email.trim() && !EMAIL_REGEX.test(value.email.trim())) return false;
  if (value.consent !== true) return false;

  return true;
}

function isAnswer(value: unknown): boolean {
  if (!isRecord(value)) return false;

  if (!isString(value.questionId) || !value.questionId.trim()) return false;

  if (value.type !== 'single' && value.type !== 'multi') return false;

  if (!Array.isArray(value.selected) || value.selected.length === 0) return false;

  if (!value.selected.every((s: unknown) => isString(s) && s.trim().length > 0)) return false;

  if (value.otherText !== undefined && !isString(value.otherText)) return false;

  return true;
}

function isMetadata(value: unknown): boolean {
  if (!isRecord(value)) return false;

  if (value.submittedAt !== undefined && !isString(value.submittedAt)) return false;
  if (!isString(value.userAgent)) return false;
  if (value.referrer !== undefined && !isString(value.referrer)) return false;

  return true;
}

/**
 * Server-side helpers for the academy funnel submission.
 * Pure utilities are kept here so they can be tested without external calls.
 */

import type { FunnelSubmission } from '../funnelState';
import { QUIZ_QUESTIONS } from '../quizData';

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

/** Canonical question IDs from the quiz data, for server-side completeness checks. */
const CANONICAL_QUESTION_IDS = new Set(QUIZ_QUESTIONS.map((q) => q.id));

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

/** Expected Google Sheets columns for the Apps Script integration. */
export const FUNNEL_ROW_HEADERS = [
  'submission_id',
  'submitted_at',
  'academy_slug',
  'funnel_slug',
  'full_name',
  'whatsapp',
  'email',
  'consent',
  'user_agent',
  'referrer',
  'q1_area',
  'q1_other',
  'q2_current_situation',
  'q3_previous_experience',
  'q3_other',
  'q4_preferred_modality',
  'q5_desired_outcome',
] as const;

/**
 * Builds a per-question option-id → display-text lookup from QUIZ_QUESTIONS.
 * Lookup is per-question so duplicate option ids across questions
 * (e.g. q2 and q5 both have a "comprender" id with different texts)
 * resolve to the correct text for each question.
 */
function buildOptionTextLookup(): Map<string, Map<string, string>> {
  const lookup = new Map<string, Map<string, string>>();
  for (const q of QUIZ_QUESTIONS) {
    const optionMap = new Map(q.options.map((o) => [o.id, o.text]));
    lookup.set(q.id, optionMap);
  }
  return lookup;
}

const OPTION_TEXT_LOOKUP = buildOptionTextLookup();

/**
 * Resolves selected option IDs to their human-readable display text for a
 * given question. Unknown IDs fall back to the raw ID after sanitization.
 */
function resolveAnswerValue(questionId: string, selectedIds: string[]): string {
  const optionMap = OPTION_TEXT_LOOKUP.get(questionId);

  return selectedIds
    .map((id) => {
      const text = optionMap?.get(id);
      // Known ids are trusted quiz data; unknown ids get the raw id
      // passed through sanitizeSheetCell for formula injection protection.
      return sanitizeSheetCell(text ?? id);
    })
    .join(', ');
}

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

  // Only questions with hasOther:true get a free-text column.
  // From quizData: q1 and q3 have hasOther; q2, q4, q5 do not.
  const answerMeta = QUIZ_QUESTIONS.map((q) => ({
    id: q.id,
    hasOther: q.hasOther ?? false,
  }));

  for (const { id, hasOther } of answerMeta) {
    const answer = answersByQuestionId.get(id);
    row.push(
      answer
        ? resolveAnswerValue(answer.questionId, answer.selected)
        : '',
    );
    if (hasOther) {
      // otherText is user-entered free text — keep as-is after sanitization.
      row.push(sanitizeSheetCell(answer?.otherText?.trim() ?? ''));
    }
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

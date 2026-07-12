/**
 * VIA Orientation Funnel — Client-side state machine.
 * Pure functions: no DOM access, no side effects.
 * Imported by OrientationFunnel.astro's client script.
 */

import { QUIZ_QUESTIONS, STEP_TO_QUESTION } from './quizData';

/* ── Types ──────────────────────────────────── */

export type Step =
  | 'hero'
  | 'quiz-1'
  | 'quiz-2'
  | 'quiz-3'
  | 'quiz-4'
  | 'quiz-5'
  | 'lead'
  | 'thank-you';

export interface AnswerEntry {
  selected: string[];
  otherText: string;
}

export interface LeadData {
  fullName: string;
  whatsapp: string;
  email: string;
  consent: boolean;
}

export interface FunnelState {
  step: Step;
  answers: Record<string, AnswerEntry>;
  lead: LeadData;
  errors: Record<string, string>;
  submitting: boolean;
  submitError: string;
}

/** Frontend-owned submission payload (matches the adapter contract). */
export interface FunnelSubmission {
  academySlug: 'instituto-vision-accion';
  funnelSlug: 'via-orientation';
  contact: LeadData;
  answers: Array<{
    questionId: string;
    type: 'single' | 'multi';
    selected: string[];
    otherText?: string;
  }>;
  metadata: {
    submittedAt: string;
    userAgent: string;
    referrer?: string;
  };
}

/** Result returned by any submitFunnel adapter. */
export interface SubmissionResult {
  ok: boolean;
  submissionId?: string;
  error?: string;
}

/* ── Step Order ─────────────────────────────── */

const STEP_ORDER: Step[] = [
  'hero',
  'quiz-1', 'quiz-2', 'quiz-3', 'quiz-4', 'quiz-5',
  'lead',
  'thank-you',
];

/* ── Initialization ─────────────────────────── */

export function initState(): FunnelState {
  const answers: Record<string, AnswerEntry> = {};
  for (const q of QUIZ_QUESTIONS) {
    answers[q.id] = { selected: [], otherText: '' };
  }
  return {
    step: 'quiz-1',
    answers,
    lead: { fullName: '', whatsapp: '', email: '', consent: false },
    errors: {},
    submitting: false,
    submitError: '',
  };
}

/* ── Step Navigation ────────────────────────── */

export function nextStep(step: Step): Step | null {
  const idx = STEP_ORDER.indexOf(step);
  if (idx >= 0 && idx < STEP_ORDER.length - 1) return STEP_ORDER[idx + 1];
  return null;
}

export function prevStep(step: Step): Step | null {
  const idx = STEP_ORDER.indexOf(step);
  if (idx > 0) return STEP_ORDER[idx - 1];
  return null;
}

export function advanceTo(state: FunnelState, target: Step): FunnelState {
  return { ...state, step: target, errors: {} };
}

export function goBack(state: FunnelState): FunnelState {
  const prev = prevStep(state.step);
  if (!prev) return state;
  return { ...state, step: prev, errors: {} };
}

/* ── Quiz Helpers ───────────────────────────── */

export function getQuestionId(step: Step): string | null {
  const match = step.match(/^quiz-(\d+)$/);
  if (!match) return null;
  return STEP_TO_QUESTION[Number(match[1])] ?? null;
}

export function getQuizStepNumber(step: Step): number | null {
  const match = step.match(/^quiz-(\d+)$/);
  if (!match) return null;
  return Number(match[1]);
}

/** Toggle (multi) or set (single) an option. Returns a new state. */
export function toggleAnswer(
  state: FunnelState,
  questionId: string,
  optionId: string,
  question: { type: 'single' | 'multi'; maxSelections?: number },
): FunnelState {
  const entry = state.answers[questionId];
  if (!entry) return state;

  const newEntry = { ...entry, selected: [...entry.selected] };
  const idx = newEntry.selected.indexOf(optionId);

  if (idx >= 0) {
    // Deselect
    newEntry.selected.splice(idx, 1);
    if (optionId === 'otro') newEntry.otherText = '';
  } else {
    // Select
    if (question.type === 'single') {
      newEntry.selected = [optionId];
    } else {
      const max = question.maxSelections ?? Infinity;
      if (newEntry.selected.length >= max) return state; // Block when max reached
      newEntry.selected.push(optionId);
    }
  }

  return {
    ...state,
    answers: { ...state.answers, [questionId]: newEntry },
    errors: { ...state.errors, [stepKey(questionId)]: '' },
  };
}

export function setOtherText(
  state: FunnelState,
  questionId: string,
  text: string,
): FunnelState {
  const entry = state.answers[questionId];
  if (!entry) return state;

  return {
    ...state,
    answers: {
      ...state.answers,
      [questionId]: { ...entry, otherText: text },
    },
    errors: { ...state.errors, [stepKey(questionId)]: '' },
  };
}

/* ── Lead Helpers (placeholders for PR3) ────── */

export function updateLead(
  state: FunnelState,
  field: keyof LeadData,
  value: string | boolean,
): FunnelState {
  return {
    ...state,
    lead: { ...state.lead, [field]: value },
    errors: { ...state.errors, [field]: '' },
  };
}

export function setSubmitting(state: FunnelState, submitting: boolean): FunnelState {
  return { ...state, submitting, submitError: submitting ? '' : state.submitError };
}

export function setSubmitError(state: FunnelState, error: string): FunnelState {
  return { ...state, submitting: false, submitError: error };
}

/* ── Submission Builder ─────────────────────── */

export function buildSubmission(state: FunnelState): FunnelSubmission {
  const answers = QUIZ_QUESTIONS.map((q) => ({
    questionId: q.id,
    type: q.type,
    selected: state.answers[q.id]?.selected ?? [],
    otherText: state.answers[q.id]?.otherText || undefined,
  }));

  return {
    academySlug: 'instituto-vision-accion',
    funnelSlug: 'via-orientation',
    contact: { ...state.lead },
    answers,
    metadata: {
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
    },
  };
}

/* ── Internal ───────────────────────────────── */

function stepKey(questionId: string): string {
  const map: Record<string, string> = {
    q1: 'quiz-1',
    q2: 'quiz-2',
    q3: 'quiz-3',
    q4: 'quiz-4',
    q5: 'quiz-5',
  };
  return map[questionId] ?? questionId;
}

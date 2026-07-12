/**
 * VIA Orientation Funnel — Step validation.
 * Pure functions: no DOM access, no side effects.
 * Imported by OrientationFunnel.astro's client script.
 */

import type { QuizQuestion } from './quizData';
import type { LeadData, AnswerEntry } from './funnelState';

/* ── Quiz Validation ────────────────────────── */

/**
 * Validates an answer for a quiz question.
 * Returns an error message string, or null if valid.
 */
export function validateQuizAnswer(
  question: QuizQuestion,
  answer: AnswerEntry,
): string | null {
  // At least one selection required
  if (answer.selected.length === 0) {
    return 'Seleccioná al menos una opción para continuar.';
  }

  // When "Otro" is selected, free-text is required
  if (question.hasOther && answer.selected.includes('otro')) {
    if (!answer.otherText.trim()) {
      return 'Por favor, contanos más sobre tu elección.';
    }
  }

  return null;
}

/**
 * Validates all 5 quiz answers have at least one selection.
 * Returns a map of questionId → error, empty if all valid.
 */
export function validateAllQuizAnswers(
  state: { answers: Record<string, AnswerEntry> },
): Record<string, string> {
  // This is a lightweight validation used only as a secondary check.
  // Primary validation happens per-step via validateQuizAnswer().
  const errors: Record<string, string> = {};
  for (const [qid, entry] of Object.entries(state.answers)) {
    if (entry.selected.length === 0) {
      errors[`quiz-${qid}`] = 'Seleccioná al menos una opción para continuar.';
    }
  }
  return errors;
}

/* ── Lead Form Validation (for PR3) ─────────── */

/**
 * Validates lead form fields.
 * Returns a map of field name → error message.
 * Empty map means valid.
 */
export function validateLead(lead: LeadData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!lead.fullName.trim()) {
    errors.fullName = 'Ingresá tu nombre completo.';
  }

  if (!lead.whatsapp.trim()) {
    errors.whatsapp = 'Ingresá tu número de WhatsApp.';
  }

  // Email is optional, but validated if provided
  if (lead.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim())) {
    errors.email = 'Ingresá un email válido.';
  }

  if (!lead.consent) {
    errors.consent = 'Debés aceptar para continuar.';
  }

  return errors;
}

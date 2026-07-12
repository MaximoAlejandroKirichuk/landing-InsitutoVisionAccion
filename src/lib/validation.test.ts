/**
 * Unit tests for validation.ts — step validators.
 * Covers quiz answer validation and lead form validation.
 */
import { describe, it, expect } from 'vitest';
import { validateQuizAnswer, validateAllQuizAnswers, validateLead } from './validation';
import type { QuizQuestion } from './quizData';
import type { AnswerEntry, LeadData } from './funnelState';

/* ── Helpers ────────────────────────────────── */

const multiQ: QuizQuestion = {
  id: 'q1',
  type: 'multi',
  text: 'Test question',
  options: [{ id: 'a', text: 'A' }, { id: 'otro', text: 'Otro' }],
  hasOther: true,
};

const singleQ: QuizQuestion = {
  id: 'q2',
  type: 'single',
  text: 'Single question',
  options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }],
};

const multiNoOther: QuizQuestion = {
  id: 'q5',
  type: 'multi',
  text: 'Multi no other',
  options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }],
};

function makeAnswer(selected: string[], otherText = ''): AnswerEntry {
  return { selected, otherText };
}

function makeLead(overrides: Partial<LeadData> = {}): LeadData {
  return {
    fullName: '',
    whatsapp: '',
    email: '',
    consent: false,
    ...overrides,
  };
}

/* ── validateQuizAnswer ─────────────────────── */

describe('validateQuizAnswer()', () => {
  it('returns error when no selection is made', () => {
    const err = validateQuizAnswer(multiQ, makeAnswer([]));
    expect(err).toBeTruthy();
    expect(err).toContain('Seleccioná');
  });

  it('returns null for a valid multi-select answer', () => {
    const err = validateQuizAnswer(multiQ, makeAnswer(['a']));
    expect(err).toBeNull();
  });

  it('returns null for a valid single-select answer', () => {
    const err = validateQuizAnswer(singleQ, makeAnswer(['a']));
    expect(err).toBeNull();
  });

  it('returns null for multiple selections on multi-type', () => {
    const err = validateQuizAnswer(multiQ, makeAnswer(['a', 'otro'], 'filled'));
    expect(err).toBeNull();
  });

  describe('"Otro" free-text requirement', () => {
    it('returns error when "otro" is selected but otherText is blank', () => {
      const err = validateQuizAnswer(multiQ, makeAnswer(['otro'], '   '));
      expect(err).toBeTruthy();
      expect(err).toContain('contanos');
    });

    it('returns null when "otro" is selected and otherText is filled', () => {
      const err = validateQuizAnswer(multiQ, makeAnswer(['otro'], 'Mi área personal'));
      expect(err).toBeNull();
    });

    it('returns null when "otro" is NOT selected (hasOther irrelevant)', () => {
      // Q5 is multi with no hasOther = undefined
      const err = validateQuizAnswer(multiNoOther, makeAnswer(['a']));
      expect(err).toBeNull();
    });
  });

  it('returns null when hasOther is false/undefined and selection is valid', () => {
    const err = validateQuizAnswer(singleQ, makeAnswer(['a']));
    expect(err).toBeNull();
  });
});

/* ── validateAllQuizAnswers ─────────────────── */

describe('validateAllQuizAnswers()', () => {
  it('returns empty when all 5 questions have selections', () => {
    const state = {
      answers: {
        q1: makeAnswer(['a']),
        q2: makeAnswer(['a']),
        q3: makeAnswer(['a']),
        q4: makeAnswer(['a']),
        q5: makeAnswer(['a']),
      },
    };
    expect(validateAllQuizAnswers(state)).toEqual({});
  });

  it('returns errors for questions with empty selections', () => {
    const state = {
      answers: {
        q1: makeAnswer([]),
        q2: makeAnswer(['a']),
        q3: makeAnswer([]),
        q4: makeAnswer(['a']),
        q5: makeAnswer([]),
      },
    };
    const errors = validateAllQuizAnswers(state);
    expect(errors['quiz-q1']).toContain('Seleccioná');
    expect(errors['quiz-q3']).toContain('Seleccioná');
    expect(errors['quiz-q5']).toContain('Seleccioná');
    expect(errors['quiz-q2']).toBeUndefined();
    expect(errors['quiz-q4']).toBeUndefined();
  });
});

/* ── validateLead ───────────────────────────── */

describe('validateLead()', () => {
  it('returns empty for a fully valid lead', () => {
    const lead = makeLead({
      fullName: 'María García',
      whatsapp: '54911234567',
      email: '',
      consent: true,
    });
    expect(validateLead(lead)).toEqual({});
  });

  it('returns empty with valid email provided', () => {
    const lead = makeLead({
      fullName: 'Juan',
      whatsapp: '123',
      email: 'juan@example.com',
      consent: true,
    });
    expect(validateLead(lead)).toEqual({});
  });

  it('returns error for empty fullName', () => {
    const lead = makeLead({
      fullName: '',
      whatsapp: '123',
      consent: true,
    });
    const errors = validateLead(lead);
    expect(errors.fullName).toContain('nombre');
  });

  it('returns error for whitespace-only fullName', () => {
    const lead = makeLead({
      fullName: '   ',
      whatsapp: '123',
      consent: true,
    });
    const errors = validateLead(lead);
    expect(errors.fullName).toBeTruthy();
  });

  it('returns error for empty whatsapp', () => {
    const lead = makeLead({
      fullName: 'Ana',
      whatsapp: '',
      consent: true,
    });
    const errors = validateLead(lead);
    expect(errors.whatsapp).toContain('WhatsApp');
  });

  it('returns error for invalid email when provided', () => {
    const lead = makeLead({
      fullName: 'Ana',
      whatsapp: '123',
      email: 'not-an-email',
      consent: true,
    });
    const errors = validateLead(lead);
    expect(errors.email).toContain('email');
  });

  it('returns error for email missing @', () => {
    const lead = makeLead({
      fullName: 'Ana',
      whatsapp: '123',
      email: 'testexample.com',
      consent: true,
    });
    const errors = validateLead(lead);
    expect(errors.email).toBeTruthy();
  });

  it('accepts empty email (optional)', () => {
    const lead = makeLead({
      fullName: 'Ana',
      whatsapp: '123',
      email: '',
      consent: true,
    });
    const errors = validateLead(lead);
    expect(errors.email).toBeUndefined();
  });

  it('returns error when consent is false', () => {
    const lead = makeLead({
      fullName: 'Ana',
      whatsapp: '123',
      consent: false,
    });
    const errors = validateLead(lead);
    expect(errors.consent).toContain('aceptar');
  });

  it('returns multiple errors at once', () => {
    const lead = makeLead({
      fullName: '',
      whatsapp: '',
      email: 'bad',
      consent: false,
    });
    const errors = validateLead(lead);
    expect(Object.keys(errors)).toHaveLength(4);
    expect(errors.fullName).toBeTruthy();
    expect(errors.whatsapp).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.consent).toBeTruthy();
  });
});

/**
 * Unit tests for funnelState.ts — pure state machine helpers.
 * Covers init, navigation, answer toggling, lead mutations, and submission builder.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  initState,
  nextStep,
  prevStep,
  advanceTo,
  goBack,
  getQuestionId,
  getQuizStepNumber,
  toggleAnswer,
  setOtherText,
  updateLead,
  setSubmitting,
  setSubmitError,
  buildSubmission,
} from './funnelState';
import type { FunnelState } from './funnelState';

/* ── Helpers ────────────────────────────────── */

function stateOnStep(step: FunnelState['step']): FunnelState {
  return advanceTo(initState(), step);
}

/* ── Init ───────────────────────────────────── */

describe('initState()', () => {
  it('starts on the first quiz step', () => {
    const s = initState();
    expect(s.step).toBe('quiz-1');
  });

  it('initializes all 5 quiz answer entries as empty', () => {
    const s = initState();
    expect(Object.keys(s.answers)).toEqual(['q1', 'q2', 'q3', 'q4', 'q5']);
    for (const entry of Object.values(s.answers)) {
      expect(entry.selected).toEqual([]);
      expect(entry.otherText).toBe('');
    }
  });

  it('has empty lead data and no errors', () => {
    const s = initState();
    expect(s.lead).toEqual({ fullName: '', whatsapp: '', email: '', consent: false });
    expect(s.errors).toEqual({});
    expect(s.submitting).toBe(false);
    expect(s.submitError).toBe('');
  });
});

/* ── Step Navigation ────────────────────────── */

describe('nextStep() / prevStep()', () => {
  it('advances from hero to quiz-1', () => {
    expect(nextStep('hero')).toBe('quiz-1');
  });

  it('advances through all quiz steps sequentially', () => {
    expect(nextStep('quiz-1')).toBe('quiz-2');
    expect(nextStep('quiz-2')).toBe('quiz-3');
    expect(nextStep('quiz-3')).toBe('quiz-4');
    expect(nextStep('quiz-4')).toBe('quiz-5');
  });

  it('advances from quiz-5 to lead, lead to thank-you', () => {
    expect(nextStep('quiz-5')).toBe('lead');
    expect(nextStep('lead')).toBe('thank-you');
  });

  it('returns null at the end (thank-you)', () => {
    expect(nextStep('thank-you')).toBeNull();
  });

  it('moves backward from quiz-2 to quiz-1', () => {
    expect(prevStep('quiz-2')).toBe('quiz-1');
  });

  it('returns null at the start (hero)', () => {
    expect(prevStep('hero')).toBeNull();
  });
});

describe('advanceTo()', () => {
  it('sets the step and clears errors', () => {
    const s = { ...stateOnStep('hero'), errors: { 'quiz-1': 'oops' } };
    const result = advanceTo(s, 'quiz-1');
    expect(result.step).toBe('quiz-1');
    expect(result.errors).toEqual({});
  });
});

describe('goBack()', () => {
  it('returns to the previous step clearing errors', () => {
    const s = { ...stateOnStep('quiz-2'), errors: { 'quiz-2': 'oops' } };
    const result = goBack(s);
    expect(result.step).toBe('quiz-1');
    expect(result.errors).toEqual({});
  });

  it('preserves answers when going back', () => {
    const s = stateOnStep('quiz-2');
    s.answers.q1!.selected = ['personal'];
    const result = goBack(s);
    expect(result.answers.q1!.selected).toEqual(['personal']);
  });

  it('does nothing when on hero', () => {
    const s = stateOnStep('hero');
    expect(goBack(s).step).toBe('hero');
  });
});

/* ── Quiz Helpers ───────────────────────────── */

describe('getQuestionId()', () => {
  it('maps quiz-1 through quiz-5 to q1..q5', () => {
    expect(getQuestionId('quiz-1')).toBe('q1');
    expect(getQuestionId('quiz-2')).toBe('q2');
    expect(getQuestionId('quiz-3')).toBe('q3');
    expect(getQuestionId('quiz-4')).toBe('q4');
    expect(getQuestionId('quiz-5')).toBe('q5');
  });

  it('returns null for non-quiz steps', () => {
    expect(getQuestionId('hero')).toBeNull();
    expect(getQuestionId('lead')).toBeNull();
    expect(getQuestionId('thank-you')).toBeNull();
  });
});

describe('getQuizStepNumber()', () => {
  it('returns the numeric index', () => {
    expect(getQuizStepNumber('quiz-3')).toBe(3);
  });

  it('returns null for hero', () => {
    expect(getQuizStepNumber('hero')).toBeNull();
  });
});

/* ── Answer Toggling ────────────────────────── */

describe('toggleAnswer()', () => {
  it('selects an option (multi-type)', () => {
    const s = stateOnStep('quiz-1'); // Q1 is multi
    const result = toggleAnswer(s, 'q1', 'personal', { type: 'multi' });
    expect(result.answers.q1!.selected).toEqual(['personal']);
  });

  it('adds multiple options (multi-type)', () => {
    let s = stateOnStep('quiz-1');
    s = toggleAnswer(s, 'q1', 'personal', { type: 'multi' });
    s = toggleAnswer(s, 'q1', 'profesional', { type: 'multi' });
    expect(s.answers.q1!.selected).toEqual(['personal', 'profesional']);
  });

  it('deselects when toggling an already-selected option', () => {
    let s = stateOnStep('quiz-1');
    s = toggleAnswer(s, 'q1', 'personal', { type: 'multi' });
    s = toggleAnswer(s, 'q1', 'personal', { type: 'multi' });
    expect(s.answers.q1!.selected).toEqual([]);
  });

  it('single-select replaces the previous selection', () => {
    let s = stateOnStep('quiz-2'); // Q2 is single
    s = toggleAnswer(s, 'q2', 'explorando', { type: 'single' });
    s = toggleAnswer(s, 'q2', 'listo', { type: 'single' });
    expect(s.answers.q2!.selected).toEqual(['listo']);
  });

  it('single-select deselects on second click of the same option', () => {
    let s = stateOnStep('quiz-2');
    s = toggleAnswer(s, 'q2', 'explorando', { type: 'single' });
    s = toggleAnswer(s, 'q2', 'explorando', { type: 'single' });
    expect(s.answers.q2!.selected).toEqual([]);
  });

  it('blocks 4th selection when maxSelections=3', () => {
    let s = stateOnStep('quiz-3'); // Q3 is multi, max 3
    s = toggleAnswer(s, 'q3', 'terapia', { type: 'multi', maxSelections: 3 });
    s = toggleAnswer(s, 'q3', 'coaching', { type: 'multi', maxSelections: 3 });
    s = toggleAnswer(s, 'q3', 'autoayuda', { type: 'multi', maxSelections: 3 });
    const prev = s;
    s = toggleAnswer(s, 'q3', 'meditacion', { type: 'multi', maxSelections: 3 });
    // State must be unchanged
    expect(s.answers.q3!.selected).toEqual(prev.answers.q3!.selected);
  });

  it('clears otherText when deselecting "otro"', () => {
    let s = stateOnStep('quiz-1');
    s = toggleAnswer(s, 'q1', 'otro', { type: 'multi' });
    s = setOtherText(s, 'q1', 'my custom text');
    expect(s.answers.q1!.otherText).toBe('my custom text');

    s = toggleAnswer(s, 'q1', 'otro', { type: 'multi' });
    expect(s.answers.q1!.otherText).toBe('');
    expect(s.answers.q1!.selected).not.toContain('otro');
  });

  it('clears the error for the step on selection', () => {
    const s = { ...stateOnStep('quiz-1'), errors: { 'quiz-1': 'Seleccioná algo' } };
    const result = toggleAnswer(s, 'q1', 'personal', { type: 'multi' });
    expect(result.errors['quiz-1']).toBe('');
  });

  it('returns state unchanged for unknown questionId', () => {
    const s = stateOnStep('quiz-1');
    expect(toggleAnswer(s, 'nonexistent', 'x', { type: 'multi' })).toBe(s);
  });
});

/* ── Otro Text ──────────────────────────────── */

describe('setOtherText()', () => {
  it('sets otherText for a question', () => {
    let s = stateOnStep('quiz-1');
    s = toggleAnswer(s, 'q1', 'otro', { type: 'multi' });
    s = setOtherText(s, 'q1', 'Test text');
    expect(s.answers.q1!.otherText).toBe('Test text');
  });

  it('clears the error for that step', () => {
    let s: FunnelState = { ...stateOnStep('quiz-1'), errors: { 'quiz-1': 'oops' } };
    s = toggleAnswer(s, 'q1', 'otro', { type: 'multi' });
    s = setOtherText(s, 'q1', 'new');
    expect(s.errors['quiz-1']).toBe('');
  });

  it('returns unchanged for unknown questionId', () => {
    const s = stateOnStep('quiz-1');
    expect(setOtherText(s, 'nonexistent', 'text')).toBe(s);
  });
});

/* ── Lead Mutations ─────────────────────────── */

describe('updateLead()', () => {
  it('updates a string field and clears its error', () => {
    const s = { ...stateOnStep('lead'), errors: { fullName: 'required' } };
    const result = updateLead(s, 'fullName', 'María García');
    expect(result.lead.fullName).toBe('María García');
    expect(result.errors.fullName).toBe('');
  });

  it('updates consent (boolean)', () => {
    const s = stateOnStep('lead');
    const result = updateLead(s, 'consent', true);
    expect(result.lead.consent).toBe(true);
  });
});

describe('setSubmitting()', () => {
  it('sets submitting flag', () => {
    expect(setSubmitting(initState(), true).submitting).toBe(true);
  });

  it('clears submitError when starting a new submission', () => {
    const s = { ...initState(), submitError: 'prev error' };
    expect(setSubmitting(s, true).submitError).toBe('');
  });

  it('preserves submitError when un-setting submitting', () => {
    const s = { ...initState(), submitError: 'keep me' };
    expect(setSubmitting(s, false).submitError).toBe('keep me');
  });
});

describe('setSubmitError()', () => {
  it('sets the error and resets submitting', () => {
    const s = { ...initState(), submitting: true };
    const result = setSubmitError(s, 'Network error');
    expect(result.submitError).toBe('Network error');
    expect(result.submitting).toBe(false);
  });
});

/* ── buildSubmission() ──────────────────────── */

describe('buildSubmission()', () => {
  beforeEach(() => {
    // Mock navigator.userAgent for Node test environment
    vi.stubGlobal('navigator', { userAgent: 'test-agent' });
  });

  it('builds a FunnelSubmission with correct slugs', () => {
    const s = stateOnStep('lead');
    s.lead = { fullName: 'Test', whatsapp: '123', email: '', consent: true };
    s.answers.q1 = { selected: ['personal'], otherText: '' };

    const sub = buildSubmission(s);
    expect(sub.academySlug).toBe('instituto-vision-accion');
    expect(sub.funnelSlug).toBe('via-orientation');
  });

  it('includes contact data from state', () => {
    const s = stateOnStep('lead');
    s.lead = { fullName: 'Ana', whatsapp: '54911234567', email: 'a@b.com', consent: true };

    const sub = buildSubmission(s);
    expect(sub.contact).toEqual(s.lead);
  });

  it('maps all 5 quiz answers with type and selected', () => {
    const s = stateOnStep('lead');
    s.answers.q1 = { selected: ['personal'], otherText: '' };
    s.answers.q2 = { selected: ['listo'], otherText: '' };
    s.answers.q3 = { selected: ['terapia'], otherText: '' };
    s.answers.q4 = { selected: ['virtual'], otherText: '' };
    s.answers.q5 = { selected: ['claridad'], otherText: '' };

    const sub = buildSubmission(s);
    expect(sub.answers).toHaveLength(5);
    expect(sub.answers[0]).toEqual({
      questionId: 'q1',
      type: 'multi',
      selected: ['personal'],
      otherText: undefined,
    });
    expect(sub.answers[1].type).toBe('single');
    expect(sub.answers[2].type).toBe('multi');
  });

  it('includes otherText when non-empty', () => {
    const s = stateOnStep('lead');
    s.answers.q1 = { selected: ['otro'], otherText: 'Custom area' };

    const sub = buildSubmission(s);
    expect(sub.answers[0]!.otherText).toBe('Custom area');
  });

  it('omits otherText when empty string', () => {
    const s = stateOnStep('lead');
    s.answers.q1 = { selected: ['personal'], otherText: '' };

    const sub = buildSubmission(s);
    expect(sub.answers[0]!.otherText).toBeUndefined();
  });

  it('includes metadata with submittedAt and userAgent', () => {
    const s = stateOnStep('lead');
    const sub = buildSubmission(s);
    expect(sub.metadata.submittedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(sub.metadata.userAgent).toBe('test-agent');
  });
});

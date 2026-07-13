import { describe, expect, it } from 'vitest';
import type { FunnelSubmission } from '../funnelState';
import {
  buildFunnelSubmissionRow,
  sanitizeSheetCell,
  validateFunnelSubmissionPayload,
} from './funnelSubmission';

function makeSubmission(overrides: Partial<FunnelSubmission> = {}): FunnelSubmission {
  return {
    academySlug: 'instituto-vision-accion',
    funnelSlug: 'via-orientation',
    contact: {
      fullName: 'Ana García',
      whatsapp: '54911234567',
      email: 'ana@example.com',
      consent: true,
    },
    answers: [
      { questionId: 'q1', type: 'single', selected: ['relaciones'], otherText: '' },
      { questionId: 'q2', type: 'single', selected: ['claridad'] },
      { questionId: 'q3', type: 'multi', selected: ['coaching', 'cursos'] },
      { questionId: 'q4', type: 'multi', selected: ['online'] },
      { questionId: 'q5', type: 'single', selected: ['inicio'] },
    ],
    metadata: {
      submittedAt: '2026-07-13T12:34:56.000Z',
      userAgent: 'Vitest',
      referrer: 'https://example.com/landing',
    },
    ...overrides,
  };
}

/* ── sanitizeSheetCell ───────────────────── */

describe('sanitizeSheetCell()', () => {
  it('prefixes values starting with =', () => {
    expect(sanitizeSheetCell('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
  });

  it('prefixes values starting with +', () => {
    expect(sanitizeSheetCell('+SUM(A1:A10)')).toBe("'+SUM(A1:A10)");
  });

  it('prefixes values starting with -', () => {
    expect(sanitizeSheetCell('-SUM(A1:A10)')).toBe("'-SUM(A1:A10)");
  });

  it('prefixes values starting with @', () => {
    expect(sanitizeSheetCell('@SUM(A1:A10)')).toBe("'@SUM(A1:A10)");
  });

  it('returns normal strings unchanged', () => {
    expect(sanitizeSheetCell('Ana García')).toBe('Ana García');
    expect(sanitizeSheetCell('hello@example.com')).toBe('hello@example.com');
    expect(sanitizeSheetCell('54911234567')).toBe('54911234567');
  });

  it('returns empty string unchanged', () => {
    expect(sanitizeSheetCell('')).toBe('');
  });

  it('escapes values with leading whitespace before formula markers', () => {
    // Google Sheets ignores leading whitespace when interpreting cells,
    // so whitespace-prefixed formula payloads must be escaped too.
    expect(sanitizeSheetCell(' =SUM(A1)')).toBe("' =SUM(A1)");
    expect(sanitizeSheetCell('  =SUM(A1)')).toBe("'  =SUM(A1)");
    expect(sanitizeSheetCell('\t=CMD()')).toBe("'\t=CMD()");
    expect(sanitizeSheetCell(' +INJECT')).toBe("' +INJECT");
    expect(sanitizeSheetCell('  -EVIL')).toBe("'  -EVIL");
    expect(sanitizeSheetCell(' @REF')).toBe("' @REF");
  });

  it('does not escape values where only non-leading whitespace precedes formulas', () => {
    // Only trimStart is checked — embedded formula markers after
    // visible text are not formula triggers in Sheets.
    expect(sanitizeSheetCell('hello =SUM(A1)')).toBe('hello =SUM(A1)');
  });
});

/* ── buildFunnelSubmissionRow ────────────── */

describe('buildFunnelSubmissionRow()', () => {
  it('maps the submission to a stable spreadsheet row', () => {
    const row = buildFunnelSubmissionRow(makeSubmission(), 'submission-123');

    expect(row).toEqual([
      'submission-123',
      '2026-07-13T12:34:56.000Z',
      'instituto-vision-accion',
      'via-orientation',
      'Ana García',
      '54911234567',
      'ana@example.com',
      'true',
      'Vitest',
      'https://example.com/landing',
      'Relaciones y vínculos (pareja, familia, hijos, amistades).',
      '',
      'claridad',
      'Coaching., Cursos o talleres de desarrollo personal.',
      '',
      'Online.',
      'inicio',
    ]);
  });

  it('trims otherText before writing it to the sheet row', () => {
    const sub = makeSubmission({
      answers: [
        { questionId: 'q1', type: 'single', selected: ['relaciones'], otherText: '' },
        { questionId: 'q2', type: 'single', selected: ['claridad'] },
        { questionId: 'q3', type: 'multi', selected: ['coaching'], otherText: '   ' },
        { questionId: 'q4', type: 'multi', selected: ['online'] },
        { questionId: 'q5', type: 'single', selected: ['inicio'] },
      ],
    });
    const row = buildFunnelSubmissionRow(sub, 'submission-123');

    // q3_other is at index 14 and should be empty after trimming whitespace-only input.
    expect(row[14]).toBe('');
  });

  it('uses empty string when submittedAt is missing', () => {
    const sub = makeSubmission({ metadata: { userAgent: 'no-ts' } as FunnelSubmission['metadata'] });
    const row = buildFunnelSubmissionRow(sub, 'sub-1');
    expect(row[1]).toBe('');
  });

  it('sanitizes formula injection in contact fields', () => {
    const sub = makeSubmission({
      contact: {
        fullName: '=MALICIOUS()',
        whatsapp: '+MALICIOUS()',
        email: '-MALICIOUS()',
        consent: true,
      },
    });
    const row = buildFunnelSubmissionRow(sub, 's');

    expect(row[4]).toBe("'=MALICIOUS()");
    expect(row[5]).toBe("'+MALICIOUS()");
    expect(row[6]).toBe("'-MALICIOUS()");
  });

  it('sanitizes formula injection in metadata fields', () => {
    const sub = makeSubmission({
      metadata: {
        submittedAt: '2026-01-01T00:00:00.000Z',
        userAgent: '=AGENT()',
        referrer: '@REF()',
      },
    });
    const row = buildFunnelSubmissionRow(sub, 's');

    expect(row[8]).toBe("'=AGENT()");
    expect(row[9]).toBe("'@REF()");
  });

  it('sanitizes formula injection in answer selected labels', () => {
    const sub = makeSubmission({
      answers: [
        { questionId: 'q1', type: 'single', selected: ['=BAD()'], otherText: '' },
        { questionId: 'q2', type: 'single', selected: ['safe'] },
        { questionId: 'q3', type: 'multi', selected: ['safe'] },
        { questionId: 'q4', type: 'multi', selected: ['safe'] },
        { questionId: 'q5', type: 'single', selected: ['safe'] },
      ],
    });
    const row = buildFunnelSubmissionRow(sub, 's');

    expect(row[10]).toBe("'=BAD()");
  });

  it('sanitizes formula injection in otherText', () => {
    const sub = makeSubmission({
      answers: [
        { questionId: 'q1', type: 'single', selected: ['safe'], otherText: '' },
        { questionId: 'q2', type: 'single', selected: ['safe'] },
        { questionId: 'q3', type: 'multi', selected: ['safe'], otherText: '=CMD()' },
        { questionId: 'q4', type: 'multi', selected: ['safe'] },
        { questionId: 'q5', type: 'single', selected: ['safe'] },
      ],
    });
    const row = buildFunnelSubmissionRow(sub, 's');

    // q3_other is at index 14
    expect(row[14]).toBe("'=CMD()");
  });

  it('sanitizes formula injection in joined multi-select labels', () => {
    const sub = makeSubmission({
      answers: [
        { questionId: 'q1', type: 'single', selected: ['safe'], otherText: '' },
        { questionId: 'q2', type: 'single', selected: ['safe'] },
        { questionId: 'q3', type: 'multi', selected: ['safe', '-EVIL()'], otherText: '' },
        { questionId: 'q4', type: 'multi', selected: ['safe'] },
        { questionId: 'q5', type: 'single', selected: ['safe'] },
      ],
    });
    const row = buildFunnelSubmissionRow(sub, 's');

    // q3_previous_experience is at index 13
    expect(row[13]).toBe("safe, '-EVIL()");
  });

  it('does not sanitize server-generated values', () => {
    const row = buildFunnelSubmissionRow(makeSubmission(), 'submission-123');

    // server-generated fields stay as-is
    expect(row[0]).toBe('submission-123');
    expect(row[1]).toBe('2026-07-13T12:34:56.000Z');
    expect(row[2]).toBe('instituto-vision-accion');
    expect(row[3]).toBe('via-orientation');
    expect(row[7]).toBe('true');
  });
});

/* ── validateFunnelSubmissionPayload() ───────── */

describe('validateFunnelSubmissionPayload()', () => {
  it('accepts a fully valid submission', () => {
    const result = validateFunnelSubmissionPayload(makeSubmission());
    expect(result.ok).toBe(true);
  });

  it('accepts a valid submission with optional email omitted', () => {
    const payload = makeSubmission({ contact: { ...makeSubmission().contact, email: '' } });
    const result = validateFunnelSubmissionPayload(payload);
    expect(result.ok).toBe(true);
  });

  it('accepts a valid submission with missing submittedAt', () => {
    const payload = makeSubmission({
      metadata: { userAgent: 'no-ts' } as FunnelSubmission['metadata'],
    });
    const result = validateFunnelSubmissionPayload(payload);
    expect(result.ok).toBe(true);
  });

  it('rejects consent === false', () => {
    const payload = makeSubmission({
      contact: { ...makeSubmission().contact, consent: false },
    });
    const result = validateFunnelSubmissionPayload(payload);
    expect(result.ok).toBe(false);
  });

  it('rejects empty fullName after trim', () => {
    const payload = makeSubmission({
      contact: { ...makeSubmission().contact, fullName: '   ' },
    });
    const result = validateFunnelSubmissionPayload(payload);
    expect(result.ok).toBe(false);
  });

  it('rejects missing fullName', () => {
    const { fullName: _, ...rest } = makeSubmission().contact;
    const payload = makeSubmission({ contact: rest as FunnelSubmission['contact'] });
    const result = validateFunnelSubmissionPayload(payload);
    expect(result.ok).toBe(false);
  });

  it('rejects empty whatsapp after trim', () => {
    const payload = makeSubmission({
      contact: { ...makeSubmission().contact, whatsapp: '   ' },
    });
    const result = validateFunnelSubmissionPayload(payload);
    expect(result.ok).toBe(false);
  });

  it('rejects invalid email when provided', () => {
    const payload = makeSubmission({
      contact: { ...makeSubmission().contact, email: 'not-an-email' },
    });
    const result = validateFunnelSubmissionPayload(payload);
    expect(result.ok).toBe(false);
  });

  it('rejects email missing @', () => {
    const payload = makeSubmission({
      contact: { ...makeSubmission().contact, email: 'testexample.com' },
    });
    const result = validateFunnelSubmissionPayload(payload);
    expect(result.ok).toBe(false);
  });

  it('rejects email missing domain', () => {
    const payload = makeSubmission({
      contact: { ...makeSubmission().contact, email: 'test@' },
    });
    const result = validateFunnelSubmissionPayload(payload);
    expect(result.ok).toBe(false);
  });

  it('rejects empty answers array', () => {
    const payload = makeSubmission({ answers: [] });
    const result = validateFunnelSubmissionPayload(payload);
    expect(result.ok).toBe(false);
  });

  it('rejects answer with empty selected array', () => {
    const payload = makeSubmission({
      answers: [{ questionId: 'q1', type: 'single', selected: [] }],
    });
    const result = validateFunnelSubmissionPayload(payload);
    expect(result.ok).toBe(false);
  });

  it('rejects answer with non-string in selected', () => {
    const payload = makeSubmission({
      answers: [{ questionId: 'q1', type: 'single', selected: [123 as unknown as string] }],
    });
    const result = validateFunnelSubmissionPayload(payload);
    expect(result.ok).toBe(false);
  });

  it('rejects answer with empty-string item in selected', () => {
    const payload = makeSubmission({
      answers: [{ questionId: 'q1', type: 'single', selected: ['   '] }],
    });
    const result = validateFunnelSubmissionPayload(payload);
    expect(result.ok).toBe(false);
  });

  it('rejects answer with invalid type', () => {
    const payload = makeSubmission({
      answers: [{ questionId: 'q1', type: 'invalid' as unknown as 'single', selected: ['a'] }],
    });
    const result = validateFunnelSubmissionPayload(payload);
    expect(result.ok).toBe(false);
  });

  it('rejects answer with empty questionId after trim', () => {
    const payload = makeSubmission({
      answers: [{ questionId: '   ', type: 'single', selected: ['a'] }],
    });
    const result = validateFunnelSubmissionPayload(payload);
    expect(result.ok).toBe(false);
  });

  it('rejects answer with non-string otherText', () => {
    const payload = makeSubmission({
      answers: [{ questionId: 'q1', type: 'single', selected: ['a'], otherText: 123 as unknown as string }],
    });
    const result = validateFunnelSubmissionPayload(payload);
    expect(result.ok).toBe(false);
  });

  it('rejects non-record payloads', () => {
    expect(validateFunnelSubmissionPayload(null).ok).toBe(false);
    expect(validateFunnelSubmissionPayload('string').ok).toBe(false);
    expect(validateFunnelSubmissionPayload([]).ok).toBe(false);
  });

  it('rejects metadata with non-string submittedAt', () => {
    const payload = makeSubmission({
      metadata: { submittedAt: 123, userAgent: 'test' } as unknown as FunnelSubmission['metadata'],
    });
    const result = validateFunnelSubmissionPayload(payload);
    expect(result.ok).toBe(false);
  });

  it('returns generic error message', () => {
    const result = validateFunnelSubmissionPayload(null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Invalid submission payload.');
    }
  });

  /* ── Question completeness (Fix 5) ──────── */

  it('rejects when a canonical question is missing', () => {
    const sub = makeSubmission();
    sub.answers = sub.answers.filter((a) => a.questionId !== 'q3');
    const result = validateFunnelSubmissionPayload(sub);
    expect(result.ok).toBe(false);
  });

  it('rejects when an unexpected question id is present', () => {
    const sub = makeSubmission();
    sub.answers.push({ questionId: 'q99', type: 'single', selected: ['x'] });
    const result = validateFunnelSubmissionPayload(sub);
    expect(result.ok).toBe(false);
  });

  it('accepts canonical questions in any order', () => {
    const sub = makeSubmission();
    sub.answers = [...sub.answers].reverse();
    const result = validateFunnelSubmissionPayload(sub);
    expect(result.ok).toBe(true);
  });
});

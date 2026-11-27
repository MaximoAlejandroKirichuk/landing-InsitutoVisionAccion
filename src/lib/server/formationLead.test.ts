import { describe, expect, it } from 'vitest';
import { validateFormationLeadPayload } from './formationLead';
import { buildFunnelSubmissionRow } from './funnelSubmission';

const metadata = { userAgent: 'test-agent', referrer: 'https://example.com/', submittedAt: '2026-11-26T00:00:00.000Z' };
const contact = { fullName: '  Ana Pérez ', whatsapp: ' 11 5555 0000 ', email: 'ana@example.com', consent: true };

describe('validateFormationLeadPayload', () => {
  it('accepts a valid contact and tags it as a training lead with no quiz answers', () => {
    const result = validateFormationLeadPayload({ contact }, metadata);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.submission.funnelSlug).toBe('formacion-bio-coaching');
    expect(result.submission.contact).toEqual({
      fullName: 'Ana Pérez',
      whatsapp: '11 5555 0000',
      email: 'ana@example.com',
      consent: true,
    });
    expect(result.submission.answers).toEqual([]);
    expect(result.submission.metadata).toEqual(metadata);
  });

  it.each([
    ['missing contact', {}],
    ['not an object', 'hola'],
    ['empty name', { contact: { ...contact, fullName: ' ' } }],
    ['empty whatsapp', { contact: { ...contact, whatsapp: '' } }],
    ['bad email', { contact: { ...contact, email: 'no-es-mail' } }],
    ['no consent', { contact: { ...contact, consent: false } }],
    ['too long', { contact: { ...contact, fullName: 'a'.repeat(201) } }],
  ])('rejects %s', (_label, payload) => {
    expect(validateFormationLeadPayload(payload, metadata)).toEqual({ ok: false, error: 'Invalid lead payload.' });
  });

  it('allows an empty email, as the quiz does', () => {
    expect(validateFormationLeadPayload({ contact: { ...contact, email: '' } }, metadata).ok).toBe(true);
  });

  it('produces a sheet row aligned with quiz rows, answer columns left blank', () => {
    const result = validateFormationLeadPayload({ contact }, metadata);
    if (!result.ok) throw new Error('expected ok');
    const row = buildFunnelSubmissionRow(result.submission, 'lead-1');
    expect(row.slice(0, 8)).toEqual([
      'lead-1', metadata.submittedAt, 'instituto-vision-accion', 'formacion-bio-coaching',
      'Ana Pérez', '11 5555 0000', 'ana@example.com', 'true',
    ]);
    expect(row.slice(10).every((cell) => cell === '')).toBe(true);
  });

  it('tags the lead with the course slug and keeps the campaign UTMs', () => {
    const utm = { utm_source: 'facebook', utm_medium: 'paid', utm_campaign: 'taller-enero', evil: 'x' };
    const result = validateFormationLeadPayload({ contact, funnel: 'taller-tarot', utm }, metadata);
    if (!result.ok) throw new Error('expected ok');
    expect(result.submission.funnelSlug).toBe('taller-tarot');
    expect(result.submission.metadata.utm).toEqual({ utm_source: 'facebook', utm_medium: 'paid', utm_campaign: 'taller-enero' });
    const row = buildFunnelSubmissionRow(result.submission, 'lead-2');
    expect(row.slice(-5)).toEqual(['facebook', 'paid', 'taller-enero', '', '']);
  });

  it.each([['uppercase', 'Taller'], ['spaces', 'mi curso'], ['not a string', 3], ['too long', 'a'.repeat(61)]])(
    'rejects a course slug with %s',
    (_label, funnel) => {
      expect(validateFormationLeadPayload({ contact, funnel }, metadata).ok).toBe(false);
    },
  );
});

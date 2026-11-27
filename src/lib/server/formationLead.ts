/**
 * Lead capture for course pages (src/content/cursos/*.yaml).
 * Reuses the quiz's contact rules and Apps Script row layout, so leads land in
 * the same sheet with the course's funnel slug, empty answer columns and the campaign UTMs.
 */

import type { FunnelSubmission } from '../funnelState';
import { sanitizeUtm } from '../utm';
import { isContact } from './funnelSubmission';

/** Used when the page doesn't send a course slug (pages published before course templates). */
export const DEFAULT_FUNNEL_SLUG = 'formacion-bio-coaching';
const FUNNEL_SLUG = /^[a-z0-9-]{1,60}$/;

export type FormationLeadValidationResult =
  | { ok: true; submission: FunnelSubmission }
  | { ok: false; error: string };

const MAX_FIELD_LENGTH = 200;

export function validateFormationLeadPayload(
  payload: unknown,
  metadata: { userAgent: string; referrer?: string; submittedAt?: string },
): FormationLeadValidationResult {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return invalid();
  }
  const { contact, funnel, utm: rawUtm } = payload as Record<string, unknown>;
  if (funnel !== undefined && (typeof funnel !== 'string' || !FUNNEL_SLUG.test(funnel))) {
    return invalid();
  }
  const utm = sanitizeUtm(rawUtm);
  if (!isContact(contact)) {
    return invalid();
  }
  const fields = [contact.fullName, contact.whatsapp, contact.email];
  if (fields.some((field) => field.length > MAX_FIELD_LENGTH)) {
    return invalid();
  }

  return {
    ok: true,
    submission: {
      academySlug: 'instituto-vision-accion',
      funnelSlug: funnel ?? DEFAULT_FUNNEL_SLUG,
      contact: {
        fullName: contact.fullName.trim(),
        whatsapp: contact.whatsapp.trim(),
        email: contact.email.trim(),
        consent: true,
      },
      answers: [],
      metadata: {
        submittedAt: metadata.submittedAt ?? new Date().toISOString(),
        userAgent: metadata.userAgent,
        referrer: metadata.referrer,
        ...(Object.keys(utm).length > 0 ? { utm } : {}),
      },
    },
  };
}

function invalid(): FormationLeadValidationResult {
  return { ok: false, error: 'Invalid lead payload.' };
}

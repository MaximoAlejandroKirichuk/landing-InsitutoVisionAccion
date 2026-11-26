/**
 * Lead capture for the Bio Coaching Sistémico Integral training page.
 * Reuses the quiz's contact rules and Apps Script row layout, so leads land in
 * the same sheet with funnelSlug "formacion-bio-coaching" and empty answer columns.
 */

import type { FunnelSubmission } from '../funnelState';
import { isContact } from './funnelSubmission';

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
  const contact = (payload as Record<string, unknown>).contact;
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
      funnelSlug: 'formacion-bio-coaching',
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
      },
    },
  };
}

function invalid(): FormationLeadValidationResult {
  return { ok: false, error: 'Invalid lead payload.' };
}

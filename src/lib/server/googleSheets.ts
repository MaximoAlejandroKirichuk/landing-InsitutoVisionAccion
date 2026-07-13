/**
 * Server-side Google Sheets writer for funnel submissions.
 */

import { google } from 'googleapis';
import type { FunnelSubmission } from '../funnelState';
import {
  buildFunnelSubmissionRow,
  GoogleSheetsConfigError,
  validateGoogleSheetsConfig,
} from './funnelSubmission';

const GOOGLE_SHEETS_SCOPE = ['https://www.googleapis.com/auth/spreadsheets'];

export async function appendFunnelSubmissionToSheet(
  submission: FunnelSubmission,
  submissionId: string,
  env: Record<string, string | undefined> = process.env,
): Promise<void> {
  const configResult = validateGoogleSheetsConfig({
    GOOGLE_SHEET_ID: env.GOOGLE_SHEET_ID,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: env.GOOGLE_PRIVATE_KEY,
    GOOGLE_SHEET_RANGE: env.GOOGLE_SHEET_RANGE,
  });

  if (!configResult.ok) {
    throw new GoogleSheetsConfigError(configResult.error);
  }

  const { sheetId, serviceAccountEmail, privateKey, range } = configResult.config;
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      private_key: privateKey,
    },
    scopes: GOOGLE_SHEETS_SCOPE,
  });

  await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [buildFunnelSubmissionRow(submission, submissionId)],
    },
  });
}

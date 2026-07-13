# Instituto Visión Acción Landing

Landing + orientation funnel for Instituto Visión Acción, built with Astro.

## What this repo contains

The actual app lives in:

`instituto-Vision-Accion-FunnelVenta/`

The funnel flow is:

1. Hero section
2. VIA method section
3. 5-step orientation quiz
4. Lead capture form
5. Thank-you state

The submission adapter uses:

- **real API mode** by default, posting to `/api/funnel-submissions`
- **real API override** when `PUBLIC_FUNNEL_API_URL` is defined

## Stack

- Astro 7
- TypeScript
- Vitest

## Quick start

```bash
cd instituto-Vision-Accion-FunnelVenta
npm install
npm run dev
```

Open `http://localhost:4321`.

## Available scripts

Run these from `instituto-Vision-Accion-FunnelVenta/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run unit tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run check` | Run Astro type/content checks |

## Project structure

```text
InstitutoVisionAccion/
├── README.md
├── instituto-Vision-Accion-FunnelVenta/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── lib/
│   │   │   └── api/
│   │   ├── pages/
│   │   └── styles/
│   └── package.json
├── openspec/
└── .atl/
```

## Key files

- `src/pages/index.astro` — app entry page
- `src/components/OrientationFunnel.astro` — orchestrates the funnel flow on the client
- `src/lib/funnelState.ts` — state transitions and payload building
- `src/lib/quizData.ts` — quiz questions and options
- `src/lib/validation.ts` — quiz and lead form validation
- `src/lib/api/index.ts` — exports the real submission adapter

## Environment

To point the frontend at another deployed API endpoint, define:

```bash
PUBLIC_FUNNEL_API_URL=https://your-deployed-app.com/api/funnel-submissions
```

### Google Apps Script webhook (submission persistence)

Submissions are persisted by posting a sanitized row to a Google Apps Script Web App.
The Apps Script handler appends the row to a Google Sheet.

**Server-side env vars:**

```bash
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
GOOGLE_APPS_SCRIPT_SECRET=your-shared-secret
```

- `GOOGLE_APPS_SCRIPT_URL` (**required**) — the Web App deployment URL.
- `GOOGLE_APPS_SCRIPT_SECRET` (recommended) — shared secret sent inside the
  JSON body as the `secret` field. The Apps Script validates it before appending.
  Apps Script cannot read custom HTTP headers, so the body field is authoritative.

If `PUBLIC_FUNNEL_API_URL` is missing, the app posts to the local
`/api/funnel-submissions` endpoint.

### Google Apps Script — ready-to-copy `doPost(e)` snippet

1. Open `https://script.google.com`
2. Create a new project
3. Replace the default `Code.gs` with the snippet below
4. Deploy as a **Web App** (`Deploy` → `New deployment` → type: `Web App`)
   - Execute as: **Me**
   - Who has access: **Anyone** (the server validates the secret)
5. Copy the deployment URL and set it as `GOOGLE_APPS_SCRIPT_URL`

#### Expected Sheet columns

Set up your "Leads" sheet with these exact header columns (order matters).

Answer columns (q1_area, q2_current_situation, q3_previous_experience,
q4_preferred_modality, q5_desired_outcome) store **human-readable option
labels** (e.g. "Desarrollo personal y propósito", "Online."), not internal
option IDs. The free-text columns q1_other and q3_other contain the
user-entered value.

| Column | Header |
|--------|--------|
| A | `submission_id` |
| B | `submitted_at` |
| C | `academy_slug` |
| D | `funnel_slug` |
| E | `full_name` |
| F | `whatsapp` |
| G | `email` |
| H | `consent` |
| I | `user_agent` |
| J | `referrer` |
| K | `q1_area` |
| L | `q1_other` |
| M | `q2_current_situation` |
| N | `q3_previous_experience` |
| O | `q3_other` |
| P | `q4_preferred_modality` |
| Q | `q5_desired_outcome` |

**Ready-to-copy header row** (paste into row 1 of the "Leads" sheet):

```
submission_id	submitted_at	academy_slug	funnel_slug	full_name	whatsapp	email	consent	user_agent	referrer	q1_area	q1_other	q2_current_situation	q3_previous_experience	q3_other	q4_preferred_modality	q5_desired_outcome
```

The snippet below also auto-creates headers when the first row is empty, so you can start with a blank sheet.

```javascript
// Google Apps Script — doPost handler for funnel submissions.
// Deploy as a Web App (Execute as: Me, Access: Anyone).
// Requires a sheet named "Leads" in the active spreadsheet.
// Expected POST body (JSON):
// {
//   "submissionId": "uuid",
//   "row": ["cell1", "cell2", ...]
// }
//
// The row array has 17 cells in this fixed order:
//   submission_id, submitted_at, academy_slug, funnel_slug,
//   full_name, whatsapp, email, consent, user_agent, referrer,
//   q1_area, q1_other, q2_current_situation,
//   q3_previous_experience, q3_other, q4_preferred_modality,
//   q5_desired_outcome

var EXPECTED_SECRET = 'your-shared-secret'; // Set your secret here.
var SHEET_NAME = 'Leads';

var HEADERS = [
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
];

function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    // Apps Script does not expose custom request headers in doPost,
    // so the shared secret must be validated from the JSON body.
    var payload = JSON.parse(e.postData.contents);
    var bodySecret = payload.secret || '';

    if (EXPECTED_SECRET && bodySecret !== EXPECTED_SECRET) {
      output.setContent(JSON.stringify({ success: false, error: 'Forbidden' }));
      return output;
    }

    var row = payload.row;
    if (!row || !Array.isArray(row)) {
      output.setContent(JSON.stringify({ success: false, error: 'Missing row' }));
      return output;
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      output.setContent(JSON.stringify({ success: false, error: 'Sheet not found: ' + SHEET_NAME }));
      return output;
    }

    // Auto-create header row if the sheet is empty.
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }

    sheet.appendRow(row);
    output.setContent(JSON.stringify({ success: true }));
  } catch (err) {
    output.setContent(JSON.stringify({ success: false, error: err.message }));
  }

  return output;
}
```

> [!NOTE]
> Apps Script Web Apps always return HTTP 200 (even when `doPost` throws
> or returns an error JSON). The server-side Node code parses the JSON
> response body and only treats the submission as successful when
> `{ success: true }`. Any `success: false` payload, missing field, or
> invalid JSON is treated as a persistence failure (logged server-side
> via the API route; the client receives a generic 500).

### Rate limiting

The API endpoint applies per-IP rate limiting (default: 5 requests per 10 min).
In development and single-instance deployments the Node adapter's `clientAddress`
(socket remote address) is used as the client identifier — this is the safest
default and requires no extra configuration.

When running behind a reverse proxy (nginx, Caddy, Traefik, etc.) that terminates
TLS and forwards requests, the socket address becomes the proxy's IP. In that
scenario set the environment variable:

```
TRUST_PROXY_HEADERS=true
```

This tells the rate limiter to read `x-forwarded-for` / `x-real-ip` **only**
when you are certain your proxy strips or overwrites those headers. Without this
opt-in, forwarded headers are ignored to prevent trivial IP spoofing.

> [!WARNING]
> Do NOT set `TRUST_PROXY_HEADERS=true` unless a trusted reverse proxy is
> guaranteed to be in front of the Node process. Without a proxy that sanitises
> these headers, any client can inject arbitrary IPs.

## Testing

```bash
cd instituto-Vision-Accion-FunnelVenta
npm run test
npm run check
```

## Notes

- The repository root is mainly a wrapper/workspace.
- The deployable frontend is the nested Astro project.
- `openspec/` and `.atl/` contain planning/AI workflow artifacts, not runtime app code.

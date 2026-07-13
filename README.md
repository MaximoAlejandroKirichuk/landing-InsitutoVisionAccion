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

- **mock mode** by default
- **real API mode** when `PUBLIC_FUNNEL_API_URL` is defined

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
- `src/lib/api/index.ts` — chooses mock or real submission adapter

## Environment

To submit the funnel to the private Google Sheet, define:

```bash
PUBLIC_FUNNEL_API_URL=/api/funnel-submissions
GOOGLE_SHEET_ID=your-google-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@example.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----
GOOGLE_SHEET_RANGE=Leads!A:Z
```

Setup steps:

1. Enable the Google Sheets API in the Google Cloud project.
2. Create a service account and download its private key.
3. Share the target sheet with the service account email as an Editor.
4. Put the values above in `.env` and keep the private key out of source control.
   Use escaped `\n` line breaks for `GOOGLE_PRIVATE_KEY`.

If `PUBLIC_FUNNEL_API_URL` is missing, the app stays in mock mode.

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

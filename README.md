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

To connect the real backend, define:

```bash
PUBLIC_FUNNEL_API_URL=https://your-api.example.com
```

If the variable is missing, the app stays in mock mode.

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

## Exploration: via-orientation-funnel

### Current State

The repository is still a stock Astro 7 starter (`astro@^7.0.7`, TypeScript strict, ESM, no UI framework, no CSS framework, no test runner). Confirmed files:

- `src/pages/index.astro` — renders the `Welcome` starter component.
- `src/layouts/Layout.astro` — bare HTML shell with `lang="en"` and Astro-brand favicon.
- `src/components/Welcome.astro` — starter hero with Inter font and purple gradient button.
- `package.json` — only dependency is `astro`.
- `astro.config.mjs` — empty default config.
- `openspec/config.yaml` — documents the minimal stack and `strict_tdd: false`.

No funnel, quiz, form, API client, environment variables, design tokens, or tests exist yet. The approved hero, quiz, lead-capture, and thank-you content are now available, but no public backend endpoint contract exists in this repo.

### Affected Areas

- `src/pages/index.astro` — replace starter landing with the orientation funnel entry point.
- `src/layouts/Layout.astro` — set `lang="es"`, meta tags, favicon, title, viewport, and global CSS reset/typography.
- `src/components/Hero.astro` — approved headline, subtitle, primary CTA.
- `src/components/QuizStep.astro` — reusable question view for the 5 quiz steps.
- `src/components/LeadForm.astro` — name, WhatsApp, email, consent checkbox, submit CTA.
- `src/components/ThankYou.astro` — confirmation and WhatsApp CTA.
- `src/components/ProgressIndicator.astro` — quiz step progress.
- `src/components/AnswerCard.astro` — large selectable card for single/multi-select answers.
- `src/lib/funnelState.ts` — client-side state machine: step, answers, lead, errors, submit.
- `src/lib/validation.ts` — per-step and lead-form validation.
- `src/lib/api.ts` + `src/lib/api.mock.ts` — production adapter and mock boundary.
- `src/lib/quizData.ts` — approved questions, options, and selection rules.
- `src/styles/global.css` — CSS custom properties for brand palette and typography.
- `package.json` — stays on `astro` only if using vanilla JS; no framework needed.

### Approaches

1. **Pure Astro + vanilla JS client islands**
   - Description: All interactivity lives in scoped `<script>` tags inside `.astro` components, driven by a single `funnelState` module.
   - Pros: Zero new dependencies; matches the minimal Astro stack; smallest bundle; keeps PR under the 400-line budget; easiest to deploy.
   - Cons: Hand-rolled state transitions and form handling; must manage focus and reduced motion manually.
   - Effort: Medium

2. **Astro + Alpine.js**
   - Description: Add Alpine for reactive step state, card selection, and validation.
   - Pros: Declarative; good Astro integration; small footprint.
   - Cons: Adds a runtime dependency and a new conceptual model to a project that currently has none.
   - Effort: Medium

3. **Astro + React/Vue/Svelte islands**
   - Description: Render interactive steps as framework islands.
   - Pros: Mature component ecosystem.
   - Cons: Heavy overkill for one static funnel; larger bundle; contradicts the "pure Astro" context.
   - Effort: High

### Recommendation

**Proceed with Approach 1: Pure Astro + vanilla JS client islands.**

Rationale:

- The project is intentionally minimal; adding a UI framework is unnecessary scope.
- The funnel is a single page with four logical phases (Hero → 5 Quiz steps → Lead form → Thank you), which vanilla JS can handle cleanly.
- Keeping dependencies at zero minimizes deploy risk and helps the first PR stay within the 400-line review budget.
- Structure the code so the API layer can be swapped later without touching UI components.

Implementation shape:

- `src/pages/index.astro` renders `<OrientationFunnel />`.
- `OrientationFunnel.astro` owns the step state machine and mounts the four phases.
- `Hero.astro`, `QuizStep.astro`, `LeadForm.astro`, `ThankYou.astro` are presentational and receive props/events.
- `src/lib/funnelState.ts` exposes a typed state object and pure transition helpers.
- `src/lib/quizData.ts` declares the approved questions as data, including multi-select rules and max-selection limits.
- `src/lib/validation.ts` validates each step before advancing and validates the lead form before submission.
- `src/lib/api.ts` defines the public submission adapter interface; `src/lib/api.mock.ts` implements it with a resolved promise and logs to the console. The UI imports only the adapter type and the configured implementation.

### Backend Adapter / Mock Boundary

Because the public endpoint contract does not exist yet, the UI must not assume internal SaaS lead models.

- Define a frontend-only `FunnelSubmission` type that mirrors the user's approved content:
  - `academySlug` and `funnelSlug` identifiers (for future multi-academy reuse).
  - `contact`: full name, WhatsApp, optional email, consent boolean.
  - `answers`: array of `{ questionId, type: 'single' | 'multi' | 'multi-with-other', selected: string[], otherText?: string }`.
  - `metadata`: submittedAt, userAgent, optional UTM/referrer placeholders.
- `src/lib/api.ts` exports an interface or function signature like `submitFunnel(payload: FunnelSubmission): Promise<SubmissionResult>`.
- `src/lib/api.mock.ts` implements the interface with a 600 ms simulated delay and returns `{ ok: true, submissionId: 'mock-...' }`. It logs the payload so reviewers can verify shape before the real endpoint exists.
- Environment-driven switching: `src/lib/api/index.ts` selects the mock when `import.meta.env.PUBLIC_FUNNEL_API_URL` is missing, and the real adapter when it is set.
- This boundary lets the UI ship fully while the backend team agrees on the public contract. When the contract is ready, only `api.ts` and the env variable change.

### Funnel Steps and State

State shape (typed in `src/lib/funnelState.ts`):

```ts
type Step = 'hero' | 'quiz-1' | 'quiz-2' | 'quiz-3' | 'quiz-4' | 'quiz-5' | 'lead' | 'thank-you';

interface FunnelState {
  step: Step;
  answers: Record<string, { selected: string[]; otherText?: string }>;
  lead: { fullName: string; whatsapp: string; email: string; consent: boolean };
  errors: Record<string, string>;
  submitting: boolean;
  submitError?: string;
}
```

Navigation rules:

- Hero → Quiz 1 on primary CTA click.
- Quiz 1-5: "Continuar" advances when valid; "Volver" goes to the previous step.
- Quiz 3 enforces a maximum of 3 selections.
- Questions 1 and 3 show a free-text "Otro" field when the "Otro" option is selected.
- Lead form advances to Thank You after successful mock submission.
- Thank You shows the approved headline and a WhatsApp CTA to `+54 9 11 2696-7602`.

Validation:

- Each quiz step requires at least one selection.
- Lead form: full name and WhatsApp required; email optional but validated if present; consent checkbox required.
- Errors render inline below the relevant field or step.

### Design Direction

Design read: wellness/education conversion funnel for Spanish-speaking prospects seeking personal transformation, with an inspiring/warm-professional voice, leaning toward clean Astro + custom CSS with a calm, high-contrast palette and low-to-mid motion.

Dials: `DESIGN_VARIANCE: 6`, `MOTION_INTENSITY: 4`, `VISUAL_DENSITY: 3`.

BetterHelp-like conversion patterns to borrow (not branding):

- Clean, centered hero with one primary CTA above the fold.
- Large, tappable answer cards with clear selected/unselected states.
- Minimal distractions; one question per screen during the quiz.
- Generous whitespace and clear progress indicator.

Brand application:

- Primary palette: black `#000000` and gold `#FFD700`.
- Secondary: blue `#0033A0`.
- Typography: Playfair Display for headings, Montserrat for body.
- Light theme by default; dark mode not required unless brand asks later.
- No green palette, no BetterHelp logo/copy mimicry.

Accessibility baseline:

- All interactive cards are real `<button>` or `<label>` + `<input>` elements with focus rings.
- Progress indicator uses `aria-label` and `aria-current`.
- Form inputs use explicit `<label>` elements, not placeholders as labels.
- Error messages linked via `aria-describedby`.
- Respect `prefers-reduced-motion` for any transitions.

### Risks

- **Backend contract missing** — mitigated by the adapter/mock boundary, but the real `api.ts` cannot be finalized until the endpoint exists.
- **Backend integration mismatch** — if the eventual public contract differs from the frontend `FunnelSubmission` shape, the adapter will need a mapping layer.
- **Accessibility gaps** — vanilla JS hand-rolled components risk missing focus management or screen-reader announcements; must audit before ship.
- **Review-size budget** — a full single-page funnel with hero, 5 quiz steps, lead form, thank you, validation, adapter, and styles can approach or exceed 400 changed lines. Plan implementation as chained PR slices (e.g., skeleton + design tokens, hero + quiz, lead form + thank you, adapter wiring).
- **No tests** — manual QA only; recommend at least a type-check script and one Playwright smoke test as a follow-up.
- **Privacy compliance** — collecting PII (name, WhatsApp, email) with consent requires a privacy-policy link or text; confirm legal copy before going live.

### Ready for Proposal

**Yes.**

The approved product/content inputs are sufficient to model the UI, state, validation, and adapter boundary. The missing backend contract is explicitly handled by a mock/adapter layer, so implementation can proceed without blocking on the endpoint.

Recommended next phase: **sdd-propose**.

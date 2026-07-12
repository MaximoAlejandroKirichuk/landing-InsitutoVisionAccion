# Tasks: VIA Orientation Funnel

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 730–880 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (shell/brand) → PR 2 (quiz) → PR 3 (lead/adapter) → PR 4 (a11y) |
| Delivery strategy | auto-forecast |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Page shell + brand tokens + hero | PR 1 | base main; ~180–220 lines; hero renders above fold |
| 2 | Quiz engine: data, state, validation, progress | PR 2 | base main; ~270–320 lines; all selection rules verified |
| 3 | Lead form + thank-you + adapter wiring | PR 3 | base main; ~230–280 lines; submission states & env switching |
| 4 | Accessibility + reduced-motion polish | PR 4 | base main; ~50–80 lines; screen reader & focus management |

## Phase 1: Foundation — Brand Tokens & Page Shell

- [x] 1.1 Create `src/styles/global.css` — brand tokens (--via-*), CSS reset, base typography, card/button foundations
- [x] 1.2 Modify `src/layouts/Layout.astro` — lang="es", Spanish metadata, global.css import, title "Orientación | Instituto Visión en Acción"
- [x] 1.3 Create `src/components/Hero.astro` — centered headline, subtitle, primary CTA with advance handler
- [x] 1.4 Create `src/components/OrientationFunnel.astro` — root wrapper rendering hero step, client script entry point
- [x] 1.5 Modify `src/pages/index.astro` — replace starter with Layout → OrientationFunnel

## Phase 2: Core — Quiz Engine

- [x] 2.1 Create `src/lib/quizData.ts` — typed 5-question dataset with rules (multi/single, Q3 max-3, Otro flags)
- [x] 2.2 Create `src/lib/funnelState.ts` — FunnelState type, init(), step transitions, answer CRUD, buildSubmission()
- [x] 2.3 Create `src/lib/validation.ts` — validateQuizStep() per question rules, validateLead() for lead form
- [x] 2.4 Create `src/components/ProgressIndicator.astro` — 5-dot indicator with aria-current, aria-label
- [x] 2.5 Create `src/components/QuizStep.astro` — answer cards (button), Continuar/Volver, Otro input, inline errors
- [x] 2.6 Update `OrientationFunnel.astro` — render quiz steps with state integration + progress; add quiz CSS to global.css

## Phase 3: Integration — Lead Form + Thank-you + Adapter

- [x] 3.1 Create `src/lib/api/types.ts` — FunnelSubmission, SubmissionResult, submitFunnel signature
- [x] 3.2 Create `src/lib/api/mock.ts` — 600ms delay mock, console.log, { ok: true, submissionId: 'mock-<ts>' }
- [x] 3.3 Create `src/lib/api/real.ts` — POST adapter with 10s timeout, structured errors, no thrown exceptions
- [x] 3.4 Create `src/lib/api/index.ts` — export submitFunnel: env switch via PUBLIC_FUNNEL_API_URL
- [x] 3.5 Create `src/components/LeadForm.astro` — name, whatsapp, email, consent fields; inline errors; submit with loading/disabled state
- [x] 3.6 Create `src/components/ThankYou.astro` — confirmation copy, WhatsApp CTA (wa.me/5491126967602, target=_blank)
- [x] 3.7 Update `OrientationFunnel.astro` — wire lead → submit (submitFunnel) → thank-you flow; add form CSS to global.css

## Phase 4: Polish — Accessibility & Reduced Motion

- [x] 4.1 Add focus management — move focus to step heading on transition in funnelState
- [x] 4.2 Add prefers-reduced-motion CSS in global.css — disable all transitions/animations
- [x] 4.3 Verify aria-describedby error linking in QuizStep and LeadForm
- [x] 4.4 Verify polite live region (aria-live) announces step changes
- [x] 4.5 Manual QA: full funnel progression, back preserves answers, submission states, mobile layout

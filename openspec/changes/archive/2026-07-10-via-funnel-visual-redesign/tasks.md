# Tasks: VIA Funnel Visual Redesign

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~435 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: tokens+hero → PR 2: quiz+progress → PR 3: lead/thank-you+cleanup |
| Delivery strategy | auto-forecast |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes (resolved — stacked-to-main, PR1: tokens+hero)
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Brand tokens & hero redesign | PR 1 | global.css tokens, HeroScene.astro, Hero.astro restructure |
| 2 | Quiz visuals & progress | PR 2 | QuizSpotIllustration.astro, QuizStep cards, ProgressIndicator, pass questionId |
| 3 | Lead form, thank-you & cleanup | PR 3 | LeadForm frame, ThankYou scene, ThankYouScene.astro, delete unused assets |

## Phase 1: Foundation

- [x] 1.1 Fix `--via-gold` to `#FFD700`; add dark-surface, gradient, frame, focus-ring utilities in `src/styles/global.css`
- [x] 1.2 Create `src/components/illustrations/HeroScene.astro` with CSS-var fills and responsive scaling
- [x] 1.3 Create `src/components/illustrations/QuizSpotIllustration.astro` accepting `questionId` variant prop
- [x] 1.4 Create `src/components/illustrations/ThankYouScene.astro` with brand-colored confirmation scene

## Phase 2: Hero Redesign

- [x] 2.1 Restructure `Hero.astro` to split/asymmetric layout with black-to-blue gradient field and left-aligned copy
- [x] 2.2 Inject HeroScene.astro into hero right slot; add `<768px` single-column collapse styles

## Phase 3: Quiz & Progress Redesign

- [x] 3.1 Add dark-section shell and illustrated header wrapper to `QuizStep.astro`
- [x] 3.2 Apply brand-tinted borders, gold-accented selected state, and dark-background focus rings to quiz cards
- [x] 3.3 Increase progress dot weight (size, border) for dark-background visibility in `ProgressIndicator.astro`
- [x] 3.4 Pass `questionId` into `funnel:render-quiz` event detail from `OrientationFunnel.astro`

## Phase 4: Lead & Thank-You Redesign

- [x] 4.1 Wrap `LeadForm.astro` in dark-blue section background with framed white interior panel
- [x] 4.2 Convert `ThankYou.astro` to illustrated scene with gold-accented CTA card and ThankYouScene.astro

## Phase 5: Cleanup & Verification

- [x] 5.1 Delete unused `src/assets/astro.svg` and `background.svg` if unreferenced after redesign
- [x] 5.2 Verify focus-ring contrast (≥3:1) on all dark-section interactive elements
- [x] 5.3 Confirm `prefers-reduced-motion` disables all CSS transitions
- [x] 5.4 Run `vitest` — existing 61 tests must stay fully green

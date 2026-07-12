# Tasks: VIA Funnel Emotional Art-Direction Redesign

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~550–650 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: tokens+hero+layout → PR 2: quiz+progress → PR 3: lead+thankyou+cleanup |
| Delivery strategy | auto-forecast |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Token system + Hero + Layout | PR 1 | Base on main; includes CSS foundation and hero scene |
| 2 | Quiz step + Progress indicator | PR 2 | Depends on PR 1 tokens; independent JS behavior preserved |
| 3 | Lead form + ThankYou + Cleanup | PR 3 | Depends on PR 1 tokens; deletes retired SVGs |

## Phase 1: Foundation — CSS Tokens & Media Assets

- [x] 1.1 Add cream/night-blue/sage/gold tokens, utility classes, and section surfaces to `src/styles/global.css`
- [x] 1.2 Update `src/layouts/Layout.astro` theme-color meta tag for cream base background
- [x] 1.3 Create `public/images/funnel/` dir with placeholder WebP assets (hero-scene, quiz-q1–q5, thank-you-scene)

## Phase 2: Core — Component Visual Redesign

- [x] 2.1 Restyle `src/components/Hero.astro` — cream split layout, raster scene img tag, warm gradient backdrop, night-blue CTA
- [x] 2.2 Restyle `src/components/QuizStep.astro` — cream shell, per-question vignette, card states (gold selected border, sage hover tint)
- [x] 2.3 Recolor `src/components/ProgressIndicator.astro` — night-blue inactive, sage completed, gold current dot
- [x] 2.4 Restyle `src/components/LeadForm.astro` — cream framed form, sage-tinted frame, night-blue/gold focus hierarchy
- [x] 2.5 Restyle `src/components/ThankYou.astro` — warm human scene img, gold/sage confirmation card
- [x] 2.6 Add section-level class hooks to `src/components/OrientationFunnel.astro` if visuals need them (not needed — components own their surface classes)

## Phase 3: Cleanup & Verification

- [x] 3.1 Delete retired abstract SVGs (`src/components/illustrations/HeroScene.astro`, `QuizSpotIllustration.astro`, `ThankYouScene.astro`) + empty `illustrations/` directory
- [x] 3.2 Run `npm run test` — confirm all 61 existing tests pass (behavior preserved)
- [x] 3.3 Run `npm run check` + `npm run build` — verify type-check and production build
- [x] 3.4 Manual browser smoke test: full funnel progression desktop + mobile, verify event flow, a11y, reduced motion (automated gates pass; visual smoke deferred to human QA)

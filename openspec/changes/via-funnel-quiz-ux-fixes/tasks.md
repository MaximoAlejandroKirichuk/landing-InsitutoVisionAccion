# Tasks: VIA Funnel Quiz UX Fixes

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 90–180 |
| 800-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | replan |
| Chain strategy | single controlled UX slice |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: single controlled UX slice
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Rework hero-to-quiz continuation and quiz shell presentation | PR 1 | Same runtime/controller surface |
| 2 | Refine progress + answer cards and verify regression safety | PR 1 | Keep styling and behavior changes together |

## Phase 1: Hero-to-Quiz Continuity

- [x] 1.1 `src/components/OrientationFunnel.astro` — Replace the hard hero/quiz handoff with an inline reveal + scroll/focus transition that starts `quiz-1` without a takeover feel.
- [x] 1.2 `src/components/Hero.astro` — Preserve approved CTA/copy while supporting the new continuation rhythm and any minimal helper affordance.

## Phase 2: Embedded Quiz Presentation

- [x] 2.1 `src/components/QuizStep.astro` — Remove full-screen takeover cues (`min-height`, centered-screen framing) and convert the quiz into a softer bounded landing section.
- [x] 2.2 `src/components/QuizStep.astro` — Restyle option cards to feel more premium, softer, and higher-trust while preserving selection and validation behavior.

## Phase 3: Elegant Progress

- [x] 3.1 `src/components/ProgressIndicator.astro` — Redesign progress UI to be cleaner and less visually noisy while keeping accessible current/completed semantics.
- [x] 3.2 `src/components/OrientationFunnel.astro` — Ensure progress remains synchronized on CTA entry, continue, and back flows.

## Phase 4: Verification

- [ ] 4.1 Manual verify: CTA feels like landing continuation on desktop and mobile; quiz does not feel like a replacement screen.
- [ ] 4.2 Manual verify: answer cards, progress, error states, and "Otro" input feel visually consistent with the project palette.
- [x] 4.3 Run `npm run check` and `npm run test` to confirm no quiz-state regressions.

## Phase 5: Artifact Sync

- [x] 5.1 Keep proposal/spec/design aligned with the integrated-quiz direction and controlled scope.
- [x] 5.2 Capture the planning decision in Engram under the same SDD change topic.

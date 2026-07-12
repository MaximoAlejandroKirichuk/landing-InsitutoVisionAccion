# Proposal: VIA Funnel Visual Redesign

## Intent

The first visual pass was rejected because it did not express the Instituto Visión en Acción brand strongly enough. This change refreshes the funnel’s visual language only: preserve the proven funnel flow and submission behavior while making the experience feel unmistakably VIA through black/gold/blue color fields, stronger composition, and project-owned illustrations.

## Scope

### In Scope
- Redesign the hero into a more branded, BetterHelp-like illustrated composition adapted to VIA black/gold/blue.
- Restyle quiz cards, progress cues, lead form, and thank-you scene without changing funnel logic, copy rules, validation, or adapter behavior.
- Add project-owned SVG illustration components in-repo, with accessible contrast and mobile-safe layouts.

### Out of Scope
- New funnel steps, scoring, analytics, backend/API changes, or new business logic.
- Replacing Astro/vanilla JS with a CSS framework or external image pipeline.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `orientation-funnel`: update visual presentation requirements for hero layout, illustrated step treatment, and stronger brand-token application while preserving existing behavior and accessibility.

## Approach

Use a presentational-only refresh on the existing Astro components. Keep state, validation, tests, and adapter wiring intact. Rework `global.css` tokens/utilities, redesign section markup, and introduce reusable SVG scene components owned by the project.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/styles/global.css` | Modified | Correct gold token; add brand section/gradient utilities |
| `src/components/Hero.astro` | Modified | Split/asymmetric illustrated hero |
| `src/components/QuizStep.astro` | Modified | Stronger quiz-card presentation |
| `src/components/LeadForm.astro` | Modified | Branded framed form section |
| `src/components/ThankYou.astro` | Modified | Illustrated confirmation scene |
| `src/components/illustrations/*.astro` | New | Project-owned SVG scenes/spots |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Gold/blue contrast failures | Med | Audit all text/background pairs, keep gold as accent |
| SVGs feel generic or off-brand | Med | Review illustration language before full rollout |
| Review budget overrun | Med | Slice by hero, quiz visuals, then form/thank-you |

## Rollback Plan

Revert redesigned component markup/styles and remove new illustration components; keep the existing functional funnel and adapter unchanged.

## Dependencies

- Approved VIA brand palette and rejected-pass feedback from exploration

## Success Criteria

- [ ] Funnel behavior remains unchanged while the visual system shifts to a clearly branded VIA presentation.
- [ ] Hero, quiz cards, palette use, and illustration language align with the approved direction using repo-owned SVGs.
- [ ] Mobile responsiveness and accessibility remain compliant across all redesigned steps.

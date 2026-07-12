# Design: VIA Funnel Visual Redesign

## Technical Approach

Apply a presentation-only refresh on the existing Astro funnel. Keep `src/components/OrientationFunnel.astro`, state helpers, validation, and API submission contract intact; redesign section markup/CSS and add project-owned SVG components to satisfy the proposal and `orientation-funnel` delta spec.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Visual stack | Keep component-scoped CSS + `src/styles/global.css` tokens | Tailwind or raster-image pipeline | Matches the current Astro/no-framework pattern and limits regression risk. |
| Illustration strategy | Add `.astro` SVG components under `src/components/illustrations/` using CSS custom properties (`--via-ill-*`) | Inline SVG per section; external images | Reusable, themeable, repo-owned, and mobile-safe without new build dependencies. |
| Quiz shell | Restyle existing button-based option list; only add light structural wrappers for illustration/header grouping | Rebuild quiz markup or change answer logic | Preserves semantic buttons and all current selection rules. |
| Slice plan | Deliver in 3 review slices: tokens+hero, quiz+progress, lead+thank-you+asset cleanup | Single PR | Keeps each slice near the 400-line review budget and aligns with component boundaries. |

## Data Flow

Visual rendering still follows the current event-driven flow; only presentation inputs expand.

    Hero CTA ──→ OrientationFunnel script ──→ funnel:render-quiz
                                         │
                                         ├── sets step/qId data for QuizStep shell
                                         ├── funnel:render-lead
                                         └── thank-you visibility

`submitFunnel(payload)` and `buildSubmission(state)` remain unchanged. The only internal contract adjustment is adding `questionId` (and optional theme variant) to the quiz render event so `QuizStep.astro` can pick the correct spot illustration without touching backend payloads.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/styles/global.css` | Modify | Correct `--via-gold` to `#FFD700`; add dark-surface, gradient, frame, focus-ring, and illustration token utilities. |
| `src/components/Hero.astro` | Modify | Replace centered layout with split/asymmetric hero, dark field, accent banding, and right-side SVG scene. |
| `src/components/QuizStep.astro` | Modify | Add illustrated header wrapper, stronger card states, explicit mobile collapse, and dark-section shell. |
| `src/components/ProgressIndicator.astro` | Modify | Increase visual weight for current/completed steps on dark backgrounds. |
| `src/components/LeadForm.astro` | Modify | Wrap form in branded frame with dark-blue section and white interior panel. |
| `src/components/ThankYou.astro` | Modify | Convert to illustrated confirmation scene with gold-accent CTA card. |
| `src/components/OrientationFunnel.astro` | Modify | Preserve behavior; pass `questionId` into quiz render detail and keep step container orchestration. |
| `src/components/illustrations/HeroScene.astro` | Create | Main hero SVG scene for desktop/mobile scaling. |
| `src/components/illustrations/QuizSpotIllustration.astro` | Create | Small themed SVG accent keyed by question id. |
| `src/components/illustrations/ThankYouScene.astro` | Create | Confirmation illustration for final step. |
| `src/assets/astro.svg` | Delete | Remove unused starter asset if unreferenced after redesign. |
| `src/assets/background.svg` | Delete | Remove unused starter asset if unreferenced after redesign. |

## Interfaces / Contracts

```ts
type QuizIllustrationVariant = 'q1' | 'q2' | 'q3' | 'q4' | 'q5';

type QuizRenderData = {
  questionId: QuizIllustrationVariant;
  // existing fields stay unchanged
};
```

SVG components accept semantic props only:

```astro
interface Props { title?: string; class?: string; }
```

Colors come from CSS variables, not hard-coded fills, except the required gold token `#FFD700` exposed through `--via-gold`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | No regressions in `funnelState`/`validation` | Keep existing Vitest suite green. |
| Integration | Hero CTA still advances; quiz selection/lead submit still render correct step shells | Add/adjust lightweight DOM tests only if internal render payload changes. |
| E2E | Not in scope for this change | Manual browser pass across hero, quiz, lead, and thank-you on desktop/mobile widths. |

## Migration / Rollout

No migration required. Roll out as a presentational replacement of the current funnel UI.

## Open Questions

- [ ] Confirm the exact approved blue token value for large background fields; current code uses `#0033A0` but the redesign brief names “brand blue” generically.
- [ ] Confirm whether quiz spot illustrations should vary per question or use one shared motif in v1 to reduce review size.

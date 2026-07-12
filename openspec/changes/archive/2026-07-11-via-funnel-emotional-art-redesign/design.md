# Design: VIA Funnel Emotional Art-Direction Redesign

## Technical Approach

Keep the existing Astro funnel structure, client event flow, validation, and API submission untouched. Replace only the visual layer required by the proposal and `orientation-funnel` delta spec: move the page from dark blue full-bleed sections plus abstract SVGs to a warm-cream composition with raster human scenes, CSS gradients, and cream-safe interaction states.

## Architecture Decisions

### Decision: Visual media system

| Option | Tradeoff | Decision |
|---|---|---|
| Keep abstract `.astro` SVG scenes | Light and easy to theme, but repeats the rejected corporate feel | Rejected |
| Full raster everywhere | Warm and human, but too heavy for every decorative element | Partial |
| Raster scenes + CSS gradients/tints | Keeps emotional scenes where they matter and avoids asset bloat for filler | Chosen |

**Rationale**: Use raster/WebP for hero, quiz vignettes, and thank-you scene; use CSS-only gradients, borders, and soft halos for atmosphere. No new illustration SVG components.

### Decision: Replacement scope by component

| Area | Decision |
|---|---|
| `src/components/Hero.astro` | Fully replace layout styling and illustration import |
| `src/components/QuizStep.astro` | Fully replace section shell visuals; preserve render/event script |
| `src/components/LeadForm.astro` | Retune markup framing and all styles; preserve field/event behavior |
| `src/components/ThankYou.astro` | Fully replace scene/card composition |
| `src/components/ProgressIndicator.astro` | Retune colors/motion only |
| `src/components/OrientationFunnel.astro` | No behavioral changes; only optional class/data hooks if needed |

**Rationale**: The cold feel comes from section shells and illustration choices, not from the state machine.

### Decision: Palette application

**Choice**: Cream is the dominant page surface; night blue becomes ink/CTA color; gold is accent-only; sage appears in soft gradients, selected states, and separators.
**Alternatives considered**: Keep blue section backgrounds; use gold as text; make sage the dominant brand color.
**Rationale**: This matches the approved spec and avoids the previous blue-heavy, corporate tone.

## Data Flow

Visual changes sit on top of the current event-driven funnel.

    Hero/Quiz/Lead/ThankYou markup
             │
             ├── listens/dispatches custom events
             │
    OrientationFunnel state machine
             │
             ├── validation.ts / funnelState.ts
             │
             └── submitFunnel() adapter

Assets flow separately:

    public/images/*.webp ──→ component <img> tags ──→ CSS crop/frame utilities

Behavior preservation rule: replace imports, wrappers, and classes; do not change event names, IDs, form field names, question data, or submission payload shape.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/styles/global.css` | Modify | Replace token set with cream/night-blue/sage/gold surfaces, focus, cards, buttons, shadows, and utility classes |
| `src/layouts/Layout.astro` | Modify | Set cream-compatible `theme-color` and keep global CSS wiring |
| `src/components/Hero.astro` | Modify | New cream split hero, raster scene, warm gradient backdrop, CTA preserved |
| `src/components/QuizStep.astro` | Modify | New cream quiz composition, per-question vignette slot, light card states, existing script preserved |
| `src/components/ProgressIndicator.astro` | Modify | Night-blue inactive, sage completed, gold current states |
| `src/components/LeadForm.astro` | Modify | Cream framed form with sage wash and gold/night-blue focus hierarchy |
| `src/components/ThankYou.astro` | Modify | Warm confirmation composition with raster scene and CTA card |
| `src/components/OrientationFunnel.astro` | Modify | Only minimal hooks if visuals need section-level classes; no logic edits |
| `public/images/funnel/hero-scene.webp` | Create | Primary emotional hero image, preloaded/eager |
| `public/images/funnel/quiz-q1.webp` ... `quiz-q5.webp` | Create | Question-specific vignette images, lazy-loaded |
| `public/images/funnel/thank-you-scene.webp` | Create | Confirmation image for final step |
| `src/components/illustrations/HeroScene.astro` | Delete | Retired abstract SVG |
| `src/components/illustrations/QuizSpotIllustration.astro` | Delete | Retired abstract SVG |
| `src/components/illustrations/ThankYouScene.astro` | Delete | Retired abstract SVG |

## Interfaces / Contracts

No API or state contracts change. Add only presentation metadata in component-local code:

```ts
type QuizSceneMap = Record<'q1' | 'q2' | 'q3' | 'q4' | 'q5', {
  src: string;
  alt: string;
}>;
```

Use it inside `QuizStep.astro` to map `questionId` to the correct vignette without touching `QUIZ_QUESTIONS` or funnel state.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Existing funnel logic | Keep `src/lib/*.test.ts` unchanged and passing |
| Integration | Hero CTA, quiz rendering, lead render, thank-you visibility | `npm run test` + manual browser verification of unchanged event flow |
| E2E | Full funnel progression with visual swap | Manual smoke pass across desktop/mobile + `npm run check` + `npm run build` |

## Migration / Rollout

No migration required. Roll out as chained visual-only slices.

## Open Questions

- [ ] Which exact raster source is approved for the human scenes: generated, licensed, or provided by the client?
- [ ] Should the lead step stay image-free for focus, or include a small framed supporting scene above the form?
- [ ] Are placeholder WebP filenames acceptable for apply until final art is delivered?

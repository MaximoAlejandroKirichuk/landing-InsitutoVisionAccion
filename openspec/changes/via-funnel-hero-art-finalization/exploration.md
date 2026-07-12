## Exploration: via-funnel-hero-art-finalization

### Current State
`src/components/Hero.astro` renders a split hero with the copy on the left and a right-side illustration. The CTA behavior is already wired and must stay unchanged (`funnel:advance`). The hero currently points to `/images/funnel/hero-scene.svg`, and that asset is a placeholder SVG labeled as a future `hero-scene.webp` replacement. The existing warm cream / night-blue / gold / sage art direction is already the baseline.

### Affected Areas
- `src/components/Hero.astro` — hero image source and placeholder TODO live here.
- `public/images/funnel/hero-scene.svg` — current placeholder asset to be replaced or retired.
- `public/images/funnel/hero-scene.webp` — likely final asset target if the delivered art is raster.

### Approaches
1. **Hero-only asset swap** — replace the placeholder with the final hero art and update the hero component to point at the delivered asset.
   - Pros: minimal scope, preserves existing behavior, clean separation from quiz/thank-you work.
   - Cons: requires the final art asset to be ready in the expected format/ratio.
   - Effort: Low

2. **Keep the current filename and swap file contents** — retain the existing `/images/funnel/hero-scene.svg` reference and replace the file only if the final deliverable is still SVG.
   - Pros: no component change if the final art remains vector.
   - Cons: conflicts with the current TODO wording that expects `webp`, and is less likely if the final deliverable is raster.
   - Effort: Low

### Recommendation
Use the hero-only asset swap. Treat this as a visual-finalization change confined to `Hero.astro` and the hero asset path, while leaving `QuizStep.astro` and `ThankYou.astro` untouched for the next change.

### Risks
- The delivered art may not match the current aspect ratio or composition, causing layout rework.
- The final asset format may require a path/name change (`.svg` → `.webp`), which needs a small component update.
- Scope creep: nearby TODOs in quiz and thank-you views could accidentally pull this change wider.

### Ready for Proposal
Yes — tell the user this change is hero-only, with quiz/thank-you art explicitly deferred to the next SDD change.

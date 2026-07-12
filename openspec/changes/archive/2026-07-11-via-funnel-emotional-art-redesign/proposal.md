# Proposal: VIA Funnel Emotional Art-Direction Redesign

## Intent

Previous redesigns were rejected for a cold, corporate visual feel. This third pass keeps the exact approved question content and current functional behavior, but replaces the visual system with warmer, more human, emotionally resonant art direction.

## Scope

### In Scope
- Replace abstract SVG motifs with human-scene visuals and warmer section composition.
- Move to a warm-cream-led palette with night blue, gold, and sage accents.
- Redesign hero, quiz, progress, lead, and thank-you presentation without changing copy, flow, validation, or submission behavior.

### Out of Scope
- API, storage, adapter, analytics, or backend changes.
- New questions, logic, scoring, or content rewrites.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `orientation-funnel`: change visual requirements from dark abstract SVG branding to warm cream-led, human-scene presentation while preserving existing accessibility and behavior.

## Approach

Apply a presentation-only overhaul on the existing Astro funnel. Retune `src/styles/global.css`, replace abstract `.astro` illustration components with optimized raster assets in `public/images/`, and restyle section markup. Night blue becomes an anchor/ink color instead of the dominant background.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/styles/global.css` | Modified | Add cream/night-blue/gold/sage tokens and warm surfaces |
| `src/components/Hero.astro` | Modified | Warm split hero with human scene |
| `src/components/QuizStep.astro` | Modified | Cream-based question cards and vignette |
| `src/components/ProgressIndicator.astro` | Modified | Cream-safe progress colors |
| `src/components/LeadForm.astro` | Modified | Warm framed form treatment |
| `src/components/ThankYou.astro` | Modified | Human confirmation scene and warmer CTA area |
| `public/images/*` | New | Optimized human-scene assets |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Art feels inconsistent | Med | Lock scene style guide before apply |
| Raster assets hurt LCP | Med | Use optimized WebP, preload hero, lazy-load others |
| Review exceeds 400 lines | High | Chain by tokens+hero, quiz+progress, lead+thank-you+assets |

## Rollback Plan

Revert token and component style changes, restore the current illustration/background treatments, and leave funnel logic plus adapter code untouched.

## Dependencies

- Approved warm-cream/night-blue/gold/sage direction
- Approved source/style for human-scene assets

## Success Criteria

- [ ] The funnel keeps identical questions, flow, validation, and submission behavior.
- [ ] The visual system no longer reads as cold/corporate and replaces abstract SVG motifs with warmer human-led visuals.
- [ ] API and storage concerns remain deferred with no adapter contract changes.

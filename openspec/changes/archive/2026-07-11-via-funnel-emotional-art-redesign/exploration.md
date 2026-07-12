## Exploration: VIA Funnel Emotional Art Direction Redesign

### Current State

The functional funnel is solid and verified: 61 Vitest tests pass, the Astro 7 static build succeeds, and the event-driven state machine in `OrientationFunnel.astro` is unchanged. The visual layer is what now fails the brand test.

What makes it feel cold and corporate:

- **Blue dominates every full-bleed section.** `Hero.astro`, `QuizStep.astro`, `LeadForm.astro`, and `ThankYou.astro` all use `.surface-dark-blue`, a `black → #0033a0` gradient that covers the entire viewport. Blue reads as institutional, not emotional.
- **Illustrations are abstract geometry, not scenes.** `HeroScene.astro` is a compass/radar motif; `QuizSpotIllustration.astro` is a star/diamond; `ThankYouScene.astro` is a radiating checkmark. They communicate “navigation” and “completion,” but not people, feelings, or transformation.
- **Gold is timid.** It only appears as thin borders, hover accents, and focus rings. It never warms the page.
- **Typography is generic premium.** `Playfair Display` headings over `Montserrat` body is a common corporate/luxury pairing; it does not feel human or conversational.
- **Quiz options are glassy cards on a dark field.** The translucent `rgba(255,255,255,0.08)` buttons with white text feel like a SaaS onboarding form, not a wellness conversation.
- **The lead form is a white box floating in a dark-blue void.** The contrast is harsh and the warmth is missing.

What to **replace** vs. what to **retune**:

- **Replace:** the abstract SVG illustration system (`HeroScene`, `QuizSpotIllustration`, `ThankYouScene`) with human-scene raster illustrations; the dark-blue full-bleed backgrounds on hero/quiz/lead/thank-you with warm-cream-led surfaces; the serif-display heading choice with a warmer, more human type system.
- **Retune:** `src/styles/global.css` brand tokens (add cream, night blue, sage, and real gradients); quiz option card styling for light backgrounds; progress indicator colors; focus rings; button fills. Keep the component structure, event contracts, and state machine.

### Affected Areas

- `src/styles/global.css` — add warm-cream, night-blue, sage, and gradient tokens; retune neutrals, focus rings, card, and button foundations.
- `src/components/Hero.astro` — move from dark-blue full-bleed to warm-cream-led background; replace abstract compass SVG with a human scene illustration; keep split/asymmetric layout and `funnel:advance` CTA.
- `src/components/QuizStep.astro` — remove dark-blue section shell; restyle options as warm cards on cream; replace spot illustration with a per-question human vignette.
- `src/components/ProgressIndicator.astro` — recolor dots for cream background (night-blue track, gold current, sage done state).
- `src/components/LeadForm.astro` — remove dark-blue gradient; place the framed form on a warm cream surface with sage/gold accents.
- `src/components/ThankYou.astro` — replace dark-blue confirmation scene with a warm human scene and a soft gold/sage confirmation card.
- `src/components/illustrations/*.astro` — current abstract SVGs will be retired; new human-scene assets should live in `public/images/` and be referenced with real `<img>` tags.
- `src/layouts/Layout.astro` — update meta theme-color if needed; ensure the page background defaults to cream.

### Design Read

Reading this as: a wellness/education conversion funnel for Spanish-speaking prospects, moving from a corporate/trust-first language toward a BetterHelp-inspired human, warm, illustrated composition language, recolored for the Instituto Visión en Acción brand.

Recommended dials: `DESIGN_VARIANCE: 7`, `MOTION_INTENSITY: 4`, `VISUAL_DENSITY: 4`.

### Approaches

1. **Full art-direction overhaul with real human-scene raster illustrations** (recommended)
   - Replace the abstract SVG components with project-owned raster scenes (generated, commissioned, or licensed) placed in `public/images/`. Use Astro-standard `<img>` with `srcset`/`sizes`, WebP output, and `loading="lazy"` except for the hero.
   - Shift the page to a warm-cream base, use night blue for headings/selected states/CTA text, gold for borders/focus/hover, and sage-green for emotional gradients and soft accents.
   - Pros:
     - Directly solves the “cold/corporate/blue” feedback.
     - Human scenes create the emotional warmth the user wants.
     - Keeps the existing Astro + vanilla-JS stack; no new dependencies.
     - Real images can match the BetterHelp-style scene language without copying its green palette.
   - Cons:
     - Requires sourcing/generating real illustrations; hand-rolled SVG scenes are not acceptable here.
     - Raster assets increase page weight and need optimization and LCP attention.
     - Style consistency across multiple scenes must be managed.
   - Effort: Medium

2. **Redraw the SVG illustration system as human line-art/flat scenes**
   - Keep the current `.astro` SVG component pattern but replace geometric motifs with simplified human figures and narrative scenes.
   - Pros:
     - Stays vector-light and performant.
     - Keeps the existing CSS-variable theming pipeline.
   - Cons:
     - Hand-rolled human SVGs are very easy to make look generic or clip-art-like; the current rejection is partly about illustration quality.
     - Does not solve the dark-blue-dominant background problem by itself.
   - Effort: Medium-High

3. **Palette-only retune with existing abstract SVGs**
   - Recolor the current compass/star/checkmark SVGs to cream/sage/gold and soften the dark-blue gradients.
   - Pros:
     - Smallest diff.
   - Cons:
     - Does not introduce human scenes, so it will still feel emotionally empty.
     - Does not meet the user’s stated direction.
   - Effort: Low (insufficient)

### Recommendation

Proceed with **Approach 1: full art-direction overhaul with real human-scene raster illustrations**.

Rationale:

- The user explicitly asked for “BetterHelp-like human illustrated scenes.” That language points to photographic/illustrated raster scenes of people, not abstract vectors.
- The dominant dark-blue gradient is the single largest source of the corporate feeling; moving to a warm-cream base is the fastest way to change the emotional temperature.
- Night blue can remain a brand anchor by using it for ink text, selected quiz options, and CTA buttons rather than as a wall of color. Gold becomes a visible warmth accent, and sage-green adds emotional softness in gradients and hover states.
- The functional layer (state machine, validation, submission adapter) should be left untouched, so the redesign is still visual-only and low behavioral risk.

Implementation shape:

- `src/styles/global.css`: introduce `--via-cream`, `--via-night-blue`, `--via-sage`, `--via-gold`; redefine section utilities (`.surface-cream`, `.surface-sage`, `.gradient-warm`); update buttons/cards for light backgrounds.
- `public/images/`: add `hero-scene.webp`, `quiz-q1.webp` … `quiz-q5.webp`, `thank-you-scene.webp`. Use clear placeholder comments until assets are generated/provided.
- `src/components/Hero.astro`: cream background, left-aligned copy, right-side human scene, night-blue primary CTA with gold hover.
- `src/components/QuizStep.astro`: cream section, per-question human vignette, option cards with cream/white surfaces, night-blue text, gold selected border, sage hover tint.
- `src/components/ProgressIndicator.astro`: small dots on cream (night-blue inactive, sage done, gold current).
- `src/components/LeadForm.astro`: cream surface, soft sage-tinted frame, black/night-blue submit button.
- `src/components/ThankYou.astro`: warm cream, human confirmation scene, gold-accented card with sage subtle gradient.
- Retire `src/components/illustrations/*.astro` or keep only a tiny decorative mark if needed.

### Risks

- **Illustration sourcing.** Real human scenes must be generated, commissioned, or licensed before apply. Shipping hand-rolled SVG people would repeat the quality problem.
- **Performance / LCP.** Raster hero images are heavier than SVGs. The hero image must be optimized WebP, properly sized, and preloaded/priority-loaded. Other scenes should lazy-load.
- **Color consistency across generated scenes.** Without a style guide, generated images can drift in palette and tone; define a prompt/style reference before generating.
- **Accessibility / contrast.** Cream backgrounds with gold text or sage accents can fail WCAG. All body text must remain night-blue or charcoal with ≥4.5:1 contrast; gold should be used for borders/large text/CTAs, not small body copy.
- **Review size.** Redesigning global tokens + hero + quiz + lead + thank-you + adding images will likely exceed the 400-line budget. Plan chained PR slices (tokens+hero, quiz+progress, lead+thank-you+assets).
- **Brand fidelity.** The reference is BetterHelp’s scene-driven human warmth, not its green palette or rounded bubble UI. Avoid copying its specific shapes, chat-bubble motifs, or rounded-corner system.
- **Mobile crop.** Human scenes in hero and per-question spots must be composed so faces and emotional focal points survive cropping to mobile widths.

### Delivery Forecast

- 400-line budget risk: **High**.
- Chained PRs recommended: **Yes**.
- Decision needed before apply: **Yes** — confirmation of illustration source/style and approval of exact cream/night-blue/sage/gold hex values.

### Ready for Proposal

**Yes.**

The scope is clear (visual-only, art-direction focused), the functional foundation is stable, and the user’s direction is specific. The orchestrator should tell the user that the exploration recommends moving to a warm-cream-led page with night-blue/gold/sage accents and real human-scene raster illustrations, while preserving the approved questions and existing funnel behavior. The next recommended phase is **sdd-propose**.

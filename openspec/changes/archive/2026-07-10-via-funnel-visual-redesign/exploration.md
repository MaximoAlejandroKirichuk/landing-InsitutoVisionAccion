## Exploration: VIA Funnel Visual Redesign

### Current State

The functional funnel is complete and archived. The existing implementation is a pure Astro 7 static site with vanilla-JS client islands. The visual layer, however, is the source of the rejection:

- **Palette is washed out.** Pages are dominated by white/gray backgrounds with black text and only a thin gold border on hover as the brand signal.
- **No illustration language.** There are no project-owned SVGs, scenes, or spot drawings anywhere in the funnel (`public/` only contains favicons; `src/assets/` still holds Astro starter files).
- **Layout is uniformly centered and text-only.** Hero, quiz, lead form, and thank-you all use centered, single-column text blocks on near-white backgrounds.
- **Brand gold is slightly off-spec.** `global.css` defines `--via-gold: #d4a843`; the approved brand color is `#FFD700`.
- **Each step is a full viewport section.** `min-height: 100dvh` is already used everywhere, which is good for large color-field compositions but currently left blank.

The underlying functional flow (step state machine, validation, adapter wiring, 61 Vitest tests) is solid and should be preserved.

### Affected Areas

- `src/styles/global.css` — brand tokens must shift to the approved black/gold/blue, add gradient/section utilities, and lock accessible contrast rules.
- `src/components/Hero.astro` — needs a split-screen or asymmetric layout, large headline, primary CTA, and a hero scene illustration instead of centered text.
- `src/components/QuizStep.astro` — option cards need stronger color presence, selected-state treatment, and optional spot illustrations per question theme.
- `src/components/ProgressIndicator.astro` — dots should use the brand scale more boldly.
- `src/components/LeadForm.astro` — form container needs a branded frame, warm background treatment, and trust cues.
- `src/components/ThankYou.astro` — should become a warmer, illustrated confirmation scene.
- `src/components/illustrations/*.astro` (new) — project-owned SVG illustrations composed as Astro components.
- `src/assets/background.svg` / `astro.svg` — starter assets should be removed if no longer referenced.

### Design Read

Reading this as: wellness/education conversion funnel for Spanish-speaking prospects, moving from a trust-first/calm language toward a BetterHelp-inspired illustrated composition language, but recolored and adapted to the Instituto Visión en Acción brand. The page must now feel branded, warm, and visually guided rather than minimal.

Recommended dials: `DESIGN_VARIANCE: 8`, `MOTION_INTENSITY: 5`, `VISUAL_DENSITY: 4`.

### Approaches

1. **Pure presentational refresh + inline SVG illustration system** (recommended)
   - Description: Keep Astro + vanilla JS, keep the functional state machine untouched, and redesign every step with stronger brand colors, gradients, large color fields, and project-owned SVG illustrations composed as `.astro` components.
   - Pros:
     - Preserves the existing functional flow and 61 tests without structural risk.
     - Keeps the project's zero-dependency, minimal-stack philosophy.
     - SVG components can use CSS custom properties for themeable brand colors.
     - Illustrations are project-owned, scalable, and performant.
   - Cons:
     - Illustration quality depends on hand-crafted SVG work; must be reviewed for brand fit.
     - Strong color fields require careful contrast audits.
   - Effort: Medium

2. **Add Tailwind CSS + external/generated raster images**
   - Description: Introduce Tailwind and use generated PNG/WebP hero images instead of SVG.
   - Pros:
     - Faster utility-based styling; raster scenes can be more painterly.
   - Cons:
     - Adds a build-time dependency and contradicts the current "no CSS framework" stack.
     - Raster images need multiple sizes/srcset and LCP optimization.
     - User explicitly approved project-owned SVGs, not external/generated images.
   - Effort: High

3. **Lightweight CSS framework + icon-only refresh**
   - Description: Replace the current custom CSS with a utility framework and use only icon glyphs, no scene illustrations.
   - Cons:
     - Does not solve the core feedback (lack of large color fields and illustrated scenes).
     - Still feels like a template.
   - Effort: Low (but insufficient)

### Recommendation

**Proceed with Approach 1: pure presentational refresh + inline SVG illustration system.**

Rationale:

- The functional layer is already correct; a redesign that touches only CSS and component markup minimizes regression risk.
- The project is intentionally dependency-light; adding a CSS framework or image pipeline is scope creep.
- BetterHelp's visual signature is not its green palette but its **scene-driven, human, spacious composition**. That can be achieved with SVG scenes and bold brand color fields without copying the reference.
- `#FFD700` gold should be used as an accent on black or blue fields, not as text on white, to stay accessible.

Implementation shape:

- `src/styles/global.css`: update `--via-gold` to `#FFD700`; add section background utilities (`.bg-brand-blue`, `.bg-brand-gold`, `.bg-gradient-hero`); keep accessible focus rings.
- `src/components/illustrations/`: create reusable scene components (e.g., `HeroIllustration.astro`, `ConnectionIllustration.astro`, `SuccessIllustration.astro`) and spot accents.
- `src/components/Hero.astro`: split-screen layout with left-aligned headline/subtext/CTA and right-side hero illustration on a blue-to-black gradient field.
- `src/components/QuizStep.astro`: larger question headline, option cards with blue border and gold selected state, optional theme spot illustration above the question.
- `src/components/LeadForm.astro`: contained card on a warm dark-blue section with the form fields in a white panel.
- `src/components/ThankYou.astro`: centered confirmation with a success illustration and gold-accented CTA card.
- Remove unused starter assets (`src/assets/astro.svg`, `src/assets/background.svg`) if they are not referenced after the redesign.

### Risks

- **Accessibility / contrast.** `#FFD700` gold on white fails WCAG; gold must be reserved for accents on black/blue or as thin borders. Audit every text/background pair.
- **SVG illustration quality.** Hand-rolled scene SVGs can look generic if not carefully composed. This is the highest visual-risk item.
- **Review size.** Redesigning 4-5 components plus global styles plus new SVG components can exceed the 400-line budget; task planning should slice by section (hero first, then quiz, then lead/thank-you).
- **Responsiveness.** Split-screen hero and illustrated cards must collapse gracefully to single-column mobile layouts.
- **Focus visibility.** Blue focus rings on dark blue/gold backgrounds must remain perceivable; a high-contrast fallback ring may be needed.
- **Brand fidelity.** The reference is BetterHelp's composition, not its palette or typography. The redesign must avoid green, rounded bubble shapes, or copycat layouts.

### Ready for Proposal

**Yes.**

The change is well-scoped (visual-only), the functional foundation is stable, and the approved direction is clear. The orchestrator should tell the user that the exploration recommends a presentational-only redesign using project-owned SVG scenes, stronger black/gold/blue color fields, and a split-screen hero, while preserving the existing quiz flow, validation, and submission adapter.

Next recommended phase: **sdd-propose**.

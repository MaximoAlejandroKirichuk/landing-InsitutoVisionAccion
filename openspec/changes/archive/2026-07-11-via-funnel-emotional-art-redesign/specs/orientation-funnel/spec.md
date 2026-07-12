# Delta for orientation-funnel

## MODIFIED Requirements

### Requirement: Hero Display

The system MUST render a split hero on cream with human-scene raster illustration right, headline/subtitle left-aligned in night-blue. Subtitle MUST end at "Método VIA®️ (Visión • Integración • Acción)." CTA (night-blue fill, gold hover) advances to quiz. Collapses single-column at < 768px.
(Previously: black-to-blue gradient hero with abstract compass SVG)

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Hero above fold | Page loads | Render finishes | Headline, subtitle, illustration, CTA visible without scroll; CTA uses approved copy |
| CTA advances | Hero displayed | User clicks CTA | Step advances to Quiz Q1 |
| Mobile collapse | Viewport < 768px | Hero renders | Single-column stack |

---

### Requirement: Brand Token System

The system SHALL use the VIA palette. Text/background pairs MUST meet WCAG AA (4.5:1 body, 3:1 large). Gold SHALL NOT be body text on cream/white.

| Token | Usage |
|-------|-------|
| Cream | Dominant page surface, section backgrounds |
| Night Blue | Headings, ink text, selected labels, CTA fill |
| Gold `#FFD700` | Borders, selected states, focus rings, CTA hover |
| Sage | Accent gradients, hover tints, soft dividers |
| White | Card interiors, form fields on cream |
| Black | Highest-contrast elements (minimal use) |

(Previously: black/blue primary backgrounds, gold limited to dark fields, no sage)

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Gold accent only | Any section | Gold applied as border/highlight/selected | Contrast sufficient, accent perceivable |
| Night blue on cream | Cream surface | Night blue as heading/body | Contrast ≥ 4.5:1 |
| No gold body text | Light background | Gold used as text | SHALL NOT be assigned |

---

### Requirement: Accessibility

MUST use semantic HTML, explicit `<label>`, `aria-describedby` errors. Focus rings on cream MUST use night-blue (≥ 3:1). Gold text on cream/white prohibited. MUST respect `prefers-reduced-motion`.
(Previously: focus ring rules scoped to dark blue/black backgrounds)

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Screen reader progress | SR active, user advances | Step changes | Progress announces via `aria-current` |
| Reduced motion | `prefers-reduced-motion: reduce` | Step transition | No animations or transitions |
| Gold on cream blocked | Cream/white background | Gold used as text | Contrast < 4.5:1 → SHALL NOT be used |
| Focus on cream | Focusable element, cream bg | Keyboard focus | Night-blue ring ≥ 3:1 contrast |

---

### Requirement: Branded Quiz Card Presentation

Quiz cards MUST use cream/white surfaces, night-blue text. Selected state MUST show gold border, subtle sage-tinged background. Cards SHOULD support per-question human-scene vignettes. All selection rules unchanged.
(Previously: glassy translucent cards on dark-blue field with gold accent)

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Selected card | User selects answer | Card becomes selected | Gold border + sage-tinted background |
| Behavior unchanged | Branded cards rendered | Any quiz scenario runs | Outcome identical to pre-redesign spec |

---

### Requirement: Branded Scene Presentation

Lead form MUST render in a framed container on cream with sage/gold accents. Thank-you MUST render as human confirmation scene with raster illustration and gold/sage card. All copy, validation, submission unchanged.
(Previously: framed on dark-blue background; illustrated checkmark confirmation scene)

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Lead form branded | User at lead step | Form renders | Framed container on cream; validation matches existing spec |
| Thank-you human scene | Submission succeeds | Thank-you renders | Raster human illustration visible; WhatsApp CTA in gold/sage card |

---

## REMOVED Requirements

### Requirement: SVG Illustration Components

(Reason: Replaced by raster human-scene assets in `public/images/`. Abstract SVGs read corporate.)
(Migration: Remove `src/components/illustrations/`. Reference human-scene WebP via `<img>`. No functional behavior removed — presentation only.)

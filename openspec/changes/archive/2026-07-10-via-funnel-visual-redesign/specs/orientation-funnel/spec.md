# Delta for orientation-funnel

## MODIFIED Requirements

### Requirement: Hero Display

The system MUST render a split/asymmetric hero on a black-to-blue gradient field, with headline/subtitle left-aligned and a project-owned SVG illustration on the right. The subtitle MUST end at "Método VIA®️ (Visión • Integración • Acción)." with closing punctuation. The CTA MUST advance the user to the first quiz question. At viewports < 768px the layout MUST collapse to single column.

(Previously: centered hero with white/minimal background — no illustration component, no gradient field, no mobile-collapse mandate)

#### Scenario: Hero renders above the fold

- GIVEN a visitor loads the funnel page
- WHEN the page finishes rendering
- THEN the headline, subtitle, illustration, and CTA are visible without scrolling
- AND the CTA label uses the approved copy

#### Scenario: CTA advances to quiz

- GIVEN the hero is displayed
- WHEN the user clicks the primary CTA
- THEN the current step advances to Quiz Question 1

#### Scenario: Hero collapses on mobile

- GIVEN viewport width < 768px
- WHEN the hero renders
- THEN the layout stacks in single column (illustration above or below text)

### Requirement: Accessibility

All interactive elements MUST use semantic HTML: answer cards as `<button>` elements with visible focus rings, form inputs with explicit `<label>` elements (no placeholder-as-label), error messages linked via `aria-describedby`. Golde `#FFD700` MUST NOT be used as body text on white or light backgrounds. Focus rings MUST remain perceivable on dark blue/black section backgrounds (≥ 3:1 contrast). The system MUST respect `prefers-reduced-motion` by disabling transitions.

(Previously: spec covered semantic HTML and reduced motion but did not mandate gold-on-light contrast prohibition or dark-background focus-ring visibility)

#### Scenario: Screen reader announces progress

- GIVEN a screen reader is active and the user advances from Question 1 to Question 2
- WHEN the step changes
- THEN the progress indicator announces the new step via `aria-current`

#### Scenario: Reduced motion disables transitions

- GIVEN the user has `prefers-reduced-motion: reduce` set
- WHEN step transitions occur
- THEN no CSS animations or transitions execute

#### Scenario: Gold rejected as body text on light backgrounds

- GIVEN any component with white or near-white background
- WHEN gold `#FFD700` is used as text color
- THEN the contrast ratio MUST be ≥ 4.5:1 — or gold SHALL NOT be used

#### Scenario: Focus ring visible on dark sections

- GIVEN a focusable element on a blue or black section background
- WHEN the element receives keyboard focus
- THEN the focus ring achieves ≥ 3:1 contrast against its background

## ADDED Requirements

### Requirement: Brand Token System

The system SHALL use the VIA palette across all components. Gold `#FFD700` SHALL be reserved for accents (borders, selected states, thin highlights). Every text/background pair MUST meet WCAG AA contrast (4.5:1 body, 3:1 large text).

| Token | Usage |
|-------|-------|
| Black | Primary backgrounds, dark section fields |
| Brand Blue | Gradient endpoints, section backgrounds, card borders |
| Gold `#FFD700` | Accents: borders, highlights, selected-state indicators |
| White | Text on dark, card panels, form interior surfaces |

#### Scenario: Gold used as accent only

- GIVEN a section with black or blue background
- WHEN gold is applied as a border, highlight, or selected-state indicator
- THEN contrast is sufficient and the accent is perceivable

#### Scenario: Gold rejected as body text on white

- GIVEN any light-background context
- WHEN styling body text, labels, or paragraphs
- THEN gold `#FFD700` SHALL NOT be the assigned color

### Requirement: SVG Illustration Components

The system SHALL include project-owned SVG illustration components under `src/components/illustrations/` as `.astro` files. Illustrations MUST accept CSS custom properties for themeable brand colors and MUST scale gracefully at mobile viewports.

#### Scenario: Hero illustration renders with brand colors

- GIVEN the funnel page loads
- WHEN the hero section renders
- THEN the hero illustration component is visible
- AND its colors reference VIA palette tokens

#### Scenario: Illustration adapts to mobile

- GIVEN viewport width < 768px
- WHEN any illustration component renders
- THEN it scales down or stacks without horizontal overflow

### Requirement: Branded Quiz Card Presentation

Quiz answer cards MUST use brand-tinted borders and a gold-accented selected state. Cards SHOULD support optional theme spot illustrations above the question text. All existing selection rules (multi/single-select, Otro field, max-3 on Q3, empty-selection blocked) remain unchanged.

#### Scenario: Selected card shows gold accent

- GIVEN the user selects an answer option
- WHEN the card becomes selected
- THEN the card indicator uses gold `#FFD700`

#### Scenario: Quiz behavior unchanged after visual change

- GIVEN branded quiz cards are rendered
- WHEN any existing quiz scenario executes (multi-select, single-select, Otro, max-3, empty-block)
- THEN the behavioral outcome is identical to the pre-redesign spec

### Requirement: Branded Scene Presentation

The lead form MUST render inside a framed container on a dark-blue section background. The thank-you view MUST render as an illustrated confirmation scene with a gold-accented CTA card. All copy, field validation, and submission behavior remain unchanged.

#### Scenario: Lead form renders in branded frame

- GIVEN the user reaches the lead capture step
- WHEN the lead form renders
- THEN it appears inside a visibly framed container on a dark-blue background
- AND all field validation rules match the existing spec

#### Scenario: Thank-you renders as illustrated scene

- GIVEN submission succeeds
- WHEN the thank-you step renders
- THEN an illustration component is visible
- AND the WhatsApp CTA appears in a gold-accented card

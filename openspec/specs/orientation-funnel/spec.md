# orientation-funnel Specification

## Purpose

Public single-page orientation funnel UX for Instituto Visión en Acción: hero entry, 5-question quiz, lead capture with consent, and thank-you conversion to WhatsApp. No login, no authentication tokens. Approved copy and brand tokens are the authoritative data source; this spec defines behavioral rules.

## Requirements

### Requirement: Hero Display

The system MUST render a split hero on cream with human-scene raster illustration right, headline/subtitle left-aligned in night-blue. Subtitle MUST end at "Método VIA®️ (Visión • Integración • Acción)." CTA (night-blue fill, gold hover) advances to quiz. Collapses single-column at < 768px.
(Previously: black-to-blue gradient hero with abstract compass SVG)

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Hero above fold | Page loads | Render finishes | Headline, subtitle, illustration, CTA visible without scroll; CTA uses approved copy |
| CTA advances | Hero displayed | User clicks CTA | Step advances to Quiz Q1 |
| Mobile collapse | Viewport < 768px | Hero renders | Single-column stack |

---

### Requirement: Quiz Interaction Rules

The system MUST render 5 quiz questions sequentially from the approved quiz data. Question rendering MUST enforce selection rules from that data: Questions 1, 2, 4, and 5 are single-select; Question 3 is multi-select with no maximum; Questions 1 and 3 MUST display a free-text "Otro" field when the "Otro" option is selected; single-select questions MUST deselect previous choices on new selection. No scoring or category inference SHALL be performed.

#### Scenario: Single-select question with Otro

- GIVEN the user is on Question 1 (single-select)
- WHEN the user selects "Otro"
- THEN a free-text input appears below the options
- AND the user MAY type custom text

#### Scenario: Single-select deselects previous

- GIVEN the user is on Question 2 (single-select) and option A is selected
- WHEN the user selects option B
- THEN option A is deselected
- AND only option B is selected

#### Scenario: Question 3 allows multiple selections without a cap

- GIVEN the user is on Question 3
- WHEN the user selects multiple options
- THEN all selected options remain selected
- AND no maximum selection limit is enforced

#### Scenario: Empty selection blocked

- GIVEN the user has made no selection on the current question
- WHEN the user clicks "Continuar"
- THEN advancement is blocked
- AND an inline error message is displayed

---

### Requirement: Quiz Navigation & Progress

The system MUST display a progress indicator across quiz steps using `aria-current` and `aria-label`. "Continuar" advances to the next step when valid; "Volver" returns to the previous step preserving answers. Quiz state SHALL persist across back/forward navigation within the session.

#### Scenario: Back preserves answers

- GIVEN the user answered Question 1 and is on Question 2
- WHEN the user clicks "Volver"
- THEN Question 1 is displayed with previous selections intact
- AND the progress indicator updates

#### Scenario: Progress indicator reflects current step

- GIVEN the user is on Question 3 of 5
- WHEN the page renders
- THEN the progress indicator shows step 3 as current via `aria-current="step"`
- AND completed steps 1-2 are visually marked

---

### Requirement: Lead Capture Form

The system MUST render a lead form with fields: full name (required), WhatsApp phone (required), email (optional, validated if present), and a mandatory consent checkbox. Consent copy MUST match: "Acepto que Instituto Visión en Acción se contacte conmigo por WhatsApp, llamada o correo electrónico en relación con mi consulta, y autorizo el tratamiento de mis datos personales para brindarme información y una orientación personalizada." Submission SHALL NOT proceed without consent.

#### Scenario: Valid lead submission

- GIVEN full name and WhatsApp are filled, consent is checked
- WHEN the user clicks submit
- THEN validation passes and submission is initiated

#### Scenario: Missing required fields

- GIVEN full name is empty
- WHEN the user clicks submit
- THEN an inline error appears below the full name field
- AND submission is blocked

#### Scenario: Invalid email when provided

- GIVEN email contains "not-an-email"
- WHEN the user clicks submit
- THEN an inline error appears below the email field

#### Scenario: Consent not checked

- GIVEN all fields are valid but consent is unchecked
- WHEN the user clicks submit
- THEN an error message appears near the consent checkbox
- AND submission is blocked

---

### Requirement: Thank You Display

The system MUST render a confirmation view after successful submission with the approved headline, body explaining the orientation meeting, and a WhatsApp CTA linking to `https://wa.me/5491126967602`. The CTA MUST open in a new tab.

#### Scenario: Thank you after successful submission

- GIVEN submission succeeds
- WHEN the step transitions to thank-you
- THEN the approved confirmation copy is displayed
- AND the WhatsApp CTA links to +54 9 11 2696-7602

---

### Requirement: Submission State Machine

The system MUST manage four submission states: idle, submitting, success, and error. During submission, the submit button MUST be disabled and show a loading indicator. On failure, an error message MUST display and the user SHALL remain on the lead form. On success, the step MUST transition to thank-you.

#### Scenario: Loading state on submit

- GIVEN the lead form is valid and consent is checked
- WHEN the user clicks submit
- THEN the submit button is disabled and shows a loading state
- AND the user cannot resubmit

#### Scenario: Error state on failure

- GIVEN submission fails (network error or adapter rejection)
- WHEN the response is received
- THEN an error message is displayed on the lead form
- AND the user remains on the lead form
- AND the submit button is re-enabled

#### Scenario: Success transitions to thank-you

- GIVEN the mock adapter returns success
- WHEN the response is received
- THEN the step transitions to thank-you
- AND lead form data is cleared from visible state

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

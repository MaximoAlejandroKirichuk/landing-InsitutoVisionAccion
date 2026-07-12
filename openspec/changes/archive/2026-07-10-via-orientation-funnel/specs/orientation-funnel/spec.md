# orientation-funnel Specification

## Purpose

Public single-page orientation funnel UX for Instituto Visión en Acción: hero entry, 5-question quiz, lead capture with consent, and thank-you conversion to WhatsApp. No login, no authentication tokens. Approved copy and brand tokens are the authoritative data source; this spec defines behavioral rules.

## Requirements

### Requirement: Hero Display

The system MUST render a centered hero with the approved headline, subtitle, and a single primary CTA button. The subtitle MUST end at "Método VIA®️ (Visión • Integración • Acción)." with closing punctuation. The CTA MUST advance the user to the first quiz question.

#### Scenario: Hero renders above the fold

- GIVEN a visitor loads the funnel page
- WHEN the page finishes rendering
- THEN the headline, subtitle, and CTA are visible without scrolling
- AND the CTA label uses the approved copy

#### Scenario: CTA advances to quiz

- GIVEN the hero is displayed
- WHEN the user clicks the primary CTA
- THEN the current step advances to Quiz Question 1

---

### Requirement: Quiz Interaction Rules

The system MUST render 5 quiz questions sequentially from the approved quiz data. Question rendering MUST enforce selection rules from that data: multi-select questions MUST allow multiple selections; Question 3 MUST enforce a maximum of 3 selections; Questions 1 and 3 MUST display a free-text "Otro" field when the "Otro" option is selected; single-select questions MUST deselect previous choices on new selection. No scoring or category inference SHALL be performed.

#### Scenario: Multi-select question with Otro

- GIVEN the user is on Question 1 (multi-select)
- WHEN the user selects "Otro"
- THEN a free-text input appears below the options
- AND the user MAY type custom text

#### Scenario: Question 3 enforces max 3 selections

- GIVEN the user is on Question 3 and has selected 3 options
- WHEN the user attempts to select a 4th option
- THEN the 4th selection SHALL NOT register
- AND the previously selected 3 remain selected

#### Scenario: Single-select deselects previous

- GIVEN the user is on Question 2 (single-select) and option A is selected
- WHEN the user selects option B
- THEN option A is deselected
- AND only option B is selected

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

All interactive elements MUST use semantic HTML: answer cards as `<button>` elements with visible focus rings, form inputs with explicit `<label>` elements (no placeholder-as-label), error messages linked via `aria-describedby`. The system MUST respect `prefers-reduced-motion` by disabling transitions.

#### Scenario: Screen reader announces progress

- GIVEN a screen reader is active and the user advances from Question 1 to Question 2
- WHEN the step changes
- THEN the progress indicator announces the new step via `aria-current`

#### Scenario: Reduced motion disables transitions

- GIVEN the user has `prefers-reduced-motion: reduce` set
- WHEN step transitions occur
- THEN no CSS animations or transitions execute

# Delta for orientation-funnel

This delta revises the quiz entry and presentation so the funnel feels like a continuous landing experience instead of a screen takeover. It preserves the approved quiz content, core funnel sequence, and project palette.

## MODIFIED Requirements

### Requirement: Hero-to-Quiz Continuity

The system MUST keep the hero as the top-of-page context and make the CTA transition into the quiz feel like a continuation of the same landing page. Activating the CTA MUST reveal and/or bring the user to the first quiz section without the perception that the page was replaced or blocked. Approved hero copy SHALL remain unchanged.

#### Scenario: CTA leads naturally into quiz

- GIVEN the user lands on the page
- WHEN the hero CTA is activated
- THEN the first quiz question is revealed in the same page flow
- AND the viewport transitions toward the quiz section with a calm, intentional rhythm
- AND the hero no longer feels like it was replaced by a different screen

#### Scenario: Quiz remains part of landing flow

- GIVEN the user is on any quiz step
- WHEN the quiz is displayed
- THEN the quiz section appears as a progressive landing section with bounded content framing
- AND the surrounding experience retains the project's cream / night-blue / gold / sage identity

### Requirement: Elegant Quiz Progress

The system MUST present quiz progress with clear current/completed semantics while reducing visual noise. Progress feedback MUST remain synchronized with the visible quiz step after every forward/back transition and MUST preserve accessible labels/state.

#### Scenario: Progress is calm but explicit

- GIVEN the user is on Question 3 of 5
- WHEN the quiz renders
- THEN progress communicates 3 of 5 clearly
- AND the current step is visually emphasized without loud scaling or heavy contrast jumps
- AND completed steps remain distinguishable

#### Scenario: Progress stays synchronized on back

- GIVEN the user answered Question 3 and clicks "Volver"
- WHEN Question 2 is shown
- THEN the progress UI updates to step 2 immediately
- AND previous answers remain preserved

### Requirement: Premium Answer Selection

The system MUST present answer options as soft, high-trust cards that feel premium and conversion-friendly while preserving the existing answer logic and approved option copy. Selected and hover states SHALL use the existing palette with restrained emphasis.

#### Scenario: Answer cards support confident selection

- GIVEN the user is viewing a quiz question
- WHEN answer options are rendered
- THEN each option appears as a calm card with clear affordance and readable hierarchy
- AND selected states are obvious without looking aggressive or noisy

#### Scenario: Existing quiz behavior is preserved

- GIVEN the user selects answers, including "Otro" where applicable
- WHEN they continue or go back
- THEN the current validation, answer persistence, and question order continue to work as before

### Requirement: Controlled Microcopy Preservation

The system MUST preserve approved quiz and hero copy unless a tiny helper-label or progress microcopy adjustment is essential for clarity, accessibility, or the new embedded transition.

#### Scenario: Copy remains stable

- GIVEN the revised quiz UX is implemented
- WHEN content is reviewed
- THEN question text and primary CTA copy remain unchanged
- AND any added or changed text is limited to small supportive microcopy only

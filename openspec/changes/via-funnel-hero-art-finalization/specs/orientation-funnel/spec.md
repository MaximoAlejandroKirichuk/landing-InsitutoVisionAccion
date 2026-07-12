# Delta for orientation-funnel

## MODIFIED Requirements

### Requirement: Hero Display

The system MUST render a split hero on cream with finalized, project-owned hero art on the right and headline/subtitle left-aligned in night-blue. The hero art MUST replace the placeholder/TODO state while preserving the current CTA behavior, copy, responsive structure, and mobile collapse below 768px. Subtitle MUST end at "Método VIA®️ (Visión • Integración • Acción)." CTA (night-blue fill, gold hover) advances to quiz.
(Previously: placeholder hero art / pending-art TODO in the same split hero layout)

#### Scenario: Hero above fold with final art

- GIVEN the page loads at desktop width
- WHEN render finishes
- THEN the headline, subtitle, finalized hero art, and CTA are visible without scroll
- AND no placeholder or TODO hero copy is shown

#### Scenario: CTA still advances to quiz

- GIVEN the hero is displayed
- WHEN the user clicks CTA
- THEN the step advances to Quiz Q1
- AND the hero art change does not alter CTA behavior

#### Scenario: Mobile collapse remains intact

- GIVEN the viewport is below 768px
- WHEN the hero renders
- THEN the hero stacks in a single column
- AND the finalized art remains within the approved composition

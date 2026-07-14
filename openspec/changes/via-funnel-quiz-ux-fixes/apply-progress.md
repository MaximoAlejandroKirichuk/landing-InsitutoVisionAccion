# Apply Progress: VIA Funnel Quiz UX Fixes

## Status

Partial — the quiz layout correction is in place and regression checks pass, but manual browser verification is still blocked.

## Completed

- Hero-to-quiz continuation is already implemented and kept within the existing funnel flow.
- Quiz shell was reworked into a centered, bounded single-flow composition instead of the split two-column layout.
- Answer cards now use a responsive grid on desktop so dense questions scan faster without feeling modal or trapped.
- The quiz action row now sits directly under the answers, keeping the CTA visually attached to the choice block.
- Progress treatment was quieted further so the step indicator reads as part of the card rather than a second visual system.
- Proof commands passed after the last code change:
  - `npm run check`
  - `npm test`

## Blocker

`astro dev --background` fails before the app boots with a Node/rolldown compatibility error:

`SyntaxError: The requested module 'node:util' does not provide an export named 'styleText'`

That prevents real desktop/mobile browser verification for tasks 4.1 and 4.2.

## Remaining

- Manual verify desktop continuity, blank-space reduction, and nav attachment.
- Manual verify mobile spacing, answer cards, progress, error states, and `Otro` input consistency.
- Mark tasks 4.1 and 4.2 complete only after visual verification succeeds.

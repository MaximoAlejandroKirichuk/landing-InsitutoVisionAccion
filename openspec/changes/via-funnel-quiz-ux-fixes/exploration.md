## Exploration: via-funnel-quiz-ux-fixes

### Current State
The funnel is already a single Astro page with a client-side step controller in `src/components/OrientationFunnel.astro`. The hero CTA is the only entry into the quiz (`funnel:advance` → `quiz-1`), quiz steps are rendered through `funnel:render-quiz`, and progress is updated from the same controller. The quiz UI itself is presentational (`src/components/QuizStep.astro`) and only rerenders when it receives a custom event.

The currently visible behavior is therefore:
- hero is shown first,
- quiz remains hidden until the hero CTA dispatches the advance event,
- progress dots are recalculated from the current step number,
- the only explicit disabled button in the current codebase is the lead-form submit button during submission.

### Affected Areas
- `src/components/OrientationFunnel.astro` — owns step transitions, quiz render payload, and progress updates.
- `src/components/QuizStep.astro` — renders the quiz shell, buttons, and listens for quiz render events.
- `src/components/ProgressIndicator.astro` — dot markup and current/completed visual states.
- `src/lib/funnelState.ts` — step model and answer helpers used by the controller.
- `src/lib/validation.ts` — guards advance behavior when an answer is missing.

### Approaches
1. **Controller-level bug fix** — keep the current Astro-only architecture and correct the quiz step/progress/button state in `OrientationFunnel.astro` plus the affected quiz shell component(s).
   - Pros: narrow change, preserves approved copy and flow, lowest review risk.
   - Cons: requires careful DOM/state inspection to avoid masking the real issue.
   - Effort: Medium

2. **State-machine refactor** — move more UI gating into `funnelState.ts` and make step rendering derive more directly from state.
   - Pros: clearer long-term behavior boundaries.
   - Cons: wider blast radius than needed for three UX bugs; risks touching stable funnel flow.
   - Effort: High

### Recommendation
Use the controller-level bug fix. The reported problems look like runtime/UI synchronization issues, not structural gaps, so the safest path is to inspect the quiz render pipeline first and only touch the minimal files required to restore expected step visibility, progress updates, and button state.

### Risks
- The first issue may be partially a UX expectation mismatch: the current design intentionally hides the quiz until the hero CTA advances the funnel.
- Progress dots can appear “stuck” if the render event or step number is not refreshed after every state change.
- The disabled button report may refer to the lead submit loading state rather than the quiz controls, so the exact button/step must be confirmed before changing behavior.

### Ready for Proposal
Yes — keep the proposal scoped to the three reported quiz UX/behavior bugs only, and explicitly exclude hero/thank-you asset work.

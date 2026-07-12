# Design: VIA Funnel Quiz UX Fixes

## Technical Approach

Keep the existing Astro funnel state machine, but change the presentation contract so the quiz becomes an embedded continuation of the landing page. The hero stays as context, the CTA reveals/scrolls into the quiz section, and the quiz shell shifts from takeover framing to a softer section card with calmer progress and premium answer options.

## Architecture Decisions

| Decision | Options | Choice | Rationale |
|---|---|---|---|
| Hero-to-quiz transition | Full container swap; inline reveal/scroll | Inline reveal/scroll inside the same page flow | Matches conversion-lander expectations and removes the rejected takeover feeling. |
| Quiz shell structure | Keep full-height centered layout; use bounded section frame | Use bounded embedded section with softer vertical rhythm | Makes the quiz feel like landing content, not a modal/screen replacement. |
| Progress treatment | Loud dots with scale jump; quieter labeled progress | Cleaner progress row with restrained emphasis and step text | Preserves clarity while reducing noise and improving trust. |
| Answer-card emphasis | Strong contrast/button feel; soft card feel | Soft premium cards using cream/white/sage/gold accents | Better matches the requested calmer, higher-trust conversion tone. |

## Data Flow

`Hero.astro` CTA
  → `funnel:advance`
  → `OrientationFunnel.astro` advances to `quiz-1`
  → quiz section becomes active/visible
  → controlled scroll + focus move user into quiz shell
  → `funnel:render-quiz` paints Q1

`QuizStep.astro` navigation
  → `funnel:continue` / `funnel:back`
  → existing validation/state updates
  → shared render path
  → progress + answer-card state stay synchronized

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/OrientationFunnel.astro` | Modify | Replace hard container handoff with inline reveal/scroll orchestration and stable active-section state. |
| `src/components/Hero.astro` | Modify | Keep approved copy, but support the new continuation behavior and optional anchor/helper affordance if needed. |
| `src/components/QuizStep.astro` | Modify | Restyle the quiz as a bounded embedded section, reduce full-screen takeover cues, and soften answer-card hierarchy. |
| `src/components/ProgressIndicator.astro` | Modify | Introduce cleaner progress composition with accessible step labeling and restrained visual emphasis. |

## Interfaces / Contracts

```ts
type QuizRenderData = {
  questionId?: string;
  error: string;
  isFirstStep: boolean;
  isLastStep: boolean;
};
```

Contract updates:
- `funnel:advance` still starts at `quiz-1`, but the controller must also manage inline reveal/scroll rhythm.
- Quiz question logic, validation, option copy, and answer persistence remain unchanged.
- Any new helper text must be supportive microcopy only.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Integration | Hero CTA continuation behavior | Manual/browser verify CTA reveals Q1 as an in-page continuation with correct focus/scroll. |
| Integration | Progress synchronization | Verify forward/back navigation updates calm progress UI and labels correctly. |
| UI/manual | Conversion feel of answer cards | Review desktop/mobile states for hover, selected, error, and reduced-motion behavior using project palette. |
| Regression | Existing quiz logic | Run `npm run check` and `npm run test` to confirm state/validation behavior stays intact. |

## Migration / Rollout

No migration required. Rollout is a scoped UI/interaction refinement within the current funnel. Rollback is a straightforward revert of the hero handoff, progress, and quiz-shell styling changes.

## Open Questions

- [ ] Should the CTA transition use only smooth scroll, or also a brief reveal-state change for stronger orientation on mobile?
- [ ] Is one line of supportive microcopy above the quiz allowed, or should the visual continuity rely on layout alone?

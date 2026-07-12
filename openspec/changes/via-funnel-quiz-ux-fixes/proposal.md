# Proposal: VIA Funnel Quiz UX Fixes

## Intent

Replace the current takeover-like hero-to-quiz transition with an integrated landing-to-quiz flow that feels like a natural continuation of the page. The change should improve conversion trust and visual calm without redesigning the whole funnel or changing approved copy.

## Scope

### In Scope
- Rework hero CTA behavior so it leads into the quiz section naturally instead of feeling like a full-screen replacement.
- Reframe quiz presentation as a progressive landing section with softer pacing and less abrupt state change.
- Refine progress feedback to feel clearer, quieter, and more premium.
- Restyle answer cards so they feel higher-trust, softer, and more conversion-friendly within the existing palette.
- Allow only tiny microcopy adjustments when required to support the new interaction or accessibility.

### Out of Scope
- Full landing-page redesign beyond the quiz entry and quiz section.
- New quiz questions, scoring, or logic changes unrelated to presentation/flow.
- Lead form redesign beyond visual continuity already required by quiz-to-lead handoff.
- Palette replacement, new assets, or broad content rewrites.

## Capabilities

### New Capabilities
- `orientation-funnel` supports an inline, progressive hero-to-quiz transition anchored within the same landing flow.

### Modified Capabilities
- `orientation-funnel`: hero CTA behavior, quiz section presentation, progress expression, and answer-card styling are revised to improve continuity and perceived trust.

## Approach

Keep the existing Astro funnel architecture and state machine, but change the UI contract around entry and presentation. The hero remains the top-of-page context, and the CTA reveals/scrolls the user into an embedded quiz section. The quiz shell is redesigned as a softer section card with calmer progress treatment and premium option cards, while preserving approved copy and current question logic.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/OrientationFunnel.astro` | Modified | Coordinate inline CTA-to-quiz reveal, scroll/focus rhythm, and section state classes |
| `src/components/Hero.astro` | Modified | Preserve approved hero copy while aligning CTA behavior to the integrated quiz continuation |
| `src/components/QuizStep.astro` | Modified | Convert quiz shell into a softer embedded section with calmer hierarchy and premium answer cards |
| `src/components/ProgressIndicator.astro` | Modified | Replace visually noisy dot emphasis with cleaner, more elegant progress feedback |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Inline reveal feels too subtle and users miss the quiz start | Med | Use controlled scroll/focus + visible section framing below the hero |
| Premium restyle drifts into broad redesign | Med | Limit changes to hero CTA handoff, quiz shell, progress, and answer cards only |
| Small microcopy tweaks accidentally alter approved messaging | Low | Preserve existing copy except for minimal helper text required by UX clarity |

## Rollback Plan

Revert the hero-to-quiz handoff and quiz presentation changes, restoring the previous CTA transition and quiz styling while keeping the existing funnel state machine intact.

## Dependencies

- Existing `orientation-funnel` capability and approved quiz copy/content.
- Existing palette tokens: cream, night-blue, gold, and sage.

## Success Criteria

- [ ] Hero CTA feels like a natural continuation into the quiz, not a page takeover.
- [ ] Quiz presentation reads as part of the landing page with a calmer rhythm.
- [ ] Progress UI is clearer and less visually noisy.
- [ ] Answer cards feel softer, higher-trust, and more premium without broad site redesign.
- [ ] Approved copy remains unchanged except for tiny essential microcopy.

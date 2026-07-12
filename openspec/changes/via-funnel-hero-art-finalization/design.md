# Design: VIA Funnel Hero Art Finalization

## Technical Approach

Implement this as a hero-only asset integration. The existing funnel entry (`src/pages/index.astro`) already renders `OrientationFunnel.astro`, which mounts `Hero.astro` as the first step. The change stays inside the hero image contract: keep the approved project-owned SVG export, remove the hero TODO copy, and preserve the existing split layout, eager loading, CTA event dispatch, copy, palette, and mobile stacking defined by the current component and global tokens.

## Architecture Decisions

| Decision | Options | Choice | Rationale |
|---|---|---|---|
| Asset integration path | Replace file in place; change component to new filename/format | Keep `/images/funnel/hero-scene.svg`; update `Hero.astro` only if the delivered format changes | Keeps the change minimal and localized to the current image boundary. |
| Rendering mechanism | Keep `<img>`; refactor to another image abstraction | Keep the current `<img>` with explicit width/height and `loading="eager"` | Matches existing Astro-only patterns and avoids behavioral/layout drift in an asset-finalization change. |
| Scope boundary | Touch adjacent quiz/thank-you TODOs; hero-only | Hero-only | Nearby TODOs exist in `QuizStep.astro` and `ThankYou.astro`, but proposal/spec explicitly defer them. |

## Data Flow

Approved asset export
  → `public/images/funnel/hero-scene.svg`
  → `src/components/Hero.astro` `<img src="...">`
  → first render inside `OrientationFunnel.astro`
  → CTA still dispatches `funnel:advance`
  → existing funnel state machine advances to `quiz-1`

The art swap must not alter the `funnel:advance` event, DOM ids, or hero container order used by the current step orchestration.

## File Changes

| File | Action | Description |
|---|---|---|
| `public/images/funnel/hero-scene.svg` | Modify | Store the approved final hero art in the project-owned public asset path. |
| `src/components/Hero.astro` | Modify | Remove placeholder TODO comment, keep the approved SVG reference, and preserve width/height/eager loading/CTA wiring unchanged. |
| `openspec/changes/via-funnel-hero-art-finalization/design.md` | Create | Record the implementation boundary and verification plan. |

## Interfaces / Contracts

No new API or type contracts.

The hero asset contract remains:

```astro
<img
  src="/images/funnel/hero-scene.<ext>"
  alt=""
  class="hero-img"
  width="800"
  height="600"
  loading="eager"
/>
```

Constraints:
- Decorative image stays `alt=""` because the headline/subtitle already carry the meaning.
- Export should stay close to the current 800×600 ratio to avoid CSS/layout edits.
- Palette must remain within the existing cream / night-blue / gold / sage system from `src/styles/global.css`.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | None new | No logic changes are introduced. Existing `funnelState` tests remain unchanged. |
| Integration | Hero render contract | Run `npm run check` to validate Astro markup; verify `Hero.astro` still renders the same ids, CTA button, and eager image markup. |
| Visual/manual | Acceptance evidence | Desktop: hero art visible above fold with no placeholder/TODO copy. Mobile (<768px): art still stacks above text and remains within the approved composition. CTA click must still advance to Quiz Q1. |

## Migration / Rollout

No migration required. Rollout is a single visual asset replacement in the existing funnel.

## Open Questions

- [ ] Confirm final delivered filename/format before apply so the component path can stay unchanged whenever possible.
- [ ] Confirm the approved export preserves the current composition closely enough to avoid resizing or crop adjustments.

## Rollback Considerations

Rollback is file-local: restore the previous asset content and, if changed, revert the `Hero.astro` `src` value. No quiz, lead, thank-you, or state-machine files should be involved.

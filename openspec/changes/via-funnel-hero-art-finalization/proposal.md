# Proposal: VIA Funnel Hero Art Finalization

## Intent

Finalize the funnel hero from placeholder art to the approved project-owned SVG artwork while preserving the current split layout, CTA behavior, funnel flow, and the warm cream / night-blue / gold / sage direction from the archived redesign.

## Scope

### Goals
- Replace the current hero asset with the approved final hero art.
- Keep hero copy, `funnel:advance` CTA behavior, and responsive structure unchanged.
- Remove the outdated placeholder/TODO state from the hero implementation.

### Non-Goals
- Quiz fixes or quiz artwork updates.
- Thank-you artwork updates.
- CTA copy, funnel sequencing, or form behavior changes.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `orientation-funnel`: tighten the Hero Display requirement so the approved split hero uses finalized project-owned art, without changing CTA advance behavior, copy, or mobile collapse.

## Approach

Ship this as a hero-only asset finalization: keep the approved asset at `public/images/funnel/hero-scene.svg`, update `src/components/Hero.astro` only if the delivered format/name differs from the approved asset, and preserve current sizing, eager loading, palette, and interaction wiring.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/Hero.astro` | Modified | Keep the approved SVG reference and remove placeholder/TODO wording |
| `public/images/funnel/hero-scene.svg` | Modified | Store the approved final project-owned hero asset |
| `openspec/specs/orientation-funnel/spec.md` | Modified | Narrow delta on Hero Display expectations only |

## Assumptions

- Final art stays within the current composition and warm VIA palette.
- CTA behavior and funnel flow are already approved and must not move.
- This is change 1 of 2; adjacent quiz/thank-you art work is deferred.

## Open Questions

The final shipped hero asset is `public/images/funnel/hero-scene.svg`, and it stays close enough to the current aspect ratio to avoid layout tuning.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Final art ratio differs from approved composition | Low | Keep the current layout contract and avoid crop/size edits unless the SVG export changes |
| Scope drifts into quiz or thank-you views | Med | Treat non-hero art as explicit follow-up work |

## Rollout Intent

Single low-risk visual rollout in the existing funnel. No behavior flags, no staged release.

## Rollback Plan

Restore the previous `/images/funnel/hero-scene.svg` reference and the prior asset content, leaving all CTA and funnel files untouched.

## Dependencies

- Approved final hero art export with confirmed format, dimensions, and ownership.

## Success Criteria

- [ ] Hero no longer uses placeholder art or pending-art TODO copy.
- [ ] Final hero art renders correctly on desktop and mobile without changing CTA behavior.
- [ ] No quiz, lead-form, or thank-you behavior/files are expanded into this change.

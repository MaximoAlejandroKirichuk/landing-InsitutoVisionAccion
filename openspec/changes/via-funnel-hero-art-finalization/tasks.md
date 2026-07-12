# Tasks: VIA Funnel Hero Art Finalization

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~10–40 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-forecast |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Place final hero art + update Hero.astro | PR 1 (single) | One commit, one PR. Asset + component tweak + verification. |

## Phase 1: Asset Integration

- [x] 1.1 Place the approved final hero art at `public/images/funnel/hero-scene.svg` matching the delivered format
- [x] 1.2 Update `src/components/Hero.astro` — remove the placeholder/TODO comment; adjust `src` path only if format/name changed from the placeholder

## Phase 2: Verification

- [x] 2.1 Run `npm run check` to validate Astro markup integrity
- [ ] 2.2 Manual visual verification: desktop — hero art visible above fold, no placeholder/TODO copy
- [ ] 2.3 Manual visual verification: mobile (<768px) — art stacks above text, composition intact
- [ ] 2.4 Manual CTA verification: click advances to Quiz Q1 without behavior drift

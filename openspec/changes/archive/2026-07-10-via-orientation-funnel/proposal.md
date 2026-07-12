# Proposal: VIA Orientation Funnel

## Intent

Launch a public Spanish-language landing funnel that helps Instituto Visión en Acción qualify intent, capture leads, and route warm prospects to WhatsApp without login or frontend bearer tokens. The business value is faster lead capture with a focused conversion path that can ship before the public backend contract exists.

## Scope

### In Scope
- Public 4-phase flow: Hero, 5-question quiz, lead capture, thank-you with WhatsApp CTA.
- Approved copy, brand tokens, and BetterHelp-inspired information architecture adapted to VIA branding.
- Frontend-only state, validation, progress, consent, and submission through a mockable adapter boundary.

### Out of Scope
- Defining or depending on the current internal SaaS lead model.
- Final public backend contract, persistence, CRM sync, analytics, or admin reporting.
- Additional pages, authentication, localization expansion, or dark mode.

## Capabilities

### New Capabilities
- `orientation-funnel`: Public single-page orientation funnel UX, quiz progression, lead capture, consent, and thank-you conversion flow.
- `public-funnel-submission-adapter`: Frontend submission contract and environment-swappable mock/real adapter for UI-first delivery.

### Modified Capabilities
- None.

## Approach

Use pure Astro with vanilla JS islands and custom CSS. Keep the funnel UI independent from backend domain models by submitting a frontend-owned `FunnelSubmission` payload through an adapter selected by environment. Default to a mock implementation until `PUBLIC_FUNNEL_API_URL` and the public contract exist. Plan implementation as narrow slices: shell/tokens, quiz flow, lead+thank-you, adapter wiring.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/index.astro` | Modified | Replace starter page with funnel entry point |
| `src/components/*` | New | Hero, quiz, progress, lead, thank-you UI |
| `src/lib/funnelState.ts` | New | Step state and transitions |
| `src/lib/validation.ts` | New | Quiz and lead validation |
| `src/lib/api*` | New | Mock/real submission boundary |
| `src/styles/global.css` | Modified | VIA brand tokens and typography |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Backend contract changes later | High | Keep UI behind adapter and mock boundary |
| Review budget overrun | Medium | Split delivery into small chained slices |
| PII/compliance gaps | Medium | Require consent copy and legal review before go-live |

## Rollback Plan

Revert `index.astro` to the Astro starter and remove funnel-specific components/libs; keep no irreversible data migration because submission stays mocked by default.

## Dependencies

- Approved copy from exploration context
- Future public backend contract for real submission mode
- Legal/privacy confirmation for consent and contact handling

## Success Criteria

- [ ] Reviewers can trace a complete UI-first funnel without any internal SaaS coupling.
- [ ] Submission works end-to-end with a mock adapter before the real API exists.
- [ ] Scope remains sliceable into reviewable PRs near the 400-line budget.

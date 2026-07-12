# Design: VIA Orientation Funnel

## Technical Approach

Build a single Astro page that swaps funnel phases on the client with one vanilla TypeScript controller and presentational `.astro` sections. This follows the proposal's UI-first approach and both specs: `orientation-funnel` owns UX/state/validation, while `public-funnel-submission-adapter` owns a typed transport boundary with mock-first runtime selection.

## Architecture Decisions

| Decision | Options / tradeoff | Choice + rationale |
|---|---|---|
| Interaction model | Framework island adds runtime and review size; scattered inline scripts fragment state | Use `src/components/OrientationFunnel.astro` with one client script importing typed helpers from `src/lib/*`. Matches the Astro-only repo and keeps one state owner. |
| State shape | Four coarse phases are simpler for rendering, but five questions need granular progress and validation | Model one `currentStep` union (`hero`, `quiz-1..5`, `lead`, `thank-you`) plus `answers`, `lead`, `submission`. This preserves question-level rules without multiple stores. |
| Backend boundary | Posting raw form fields from UI couples components to future API changes | Define frontend-owned `FunnelSubmission` and `SubmissionResult`; UI calls only configured `submitFunnel()`. This isolates future backend mapping inside adapters. |
| Styling | Reusing starter styles conflicts with approved brand; a CSS framework adds scope | Create tokenized `src/styles/global.css` with CSS custom properties, local `@font-face`, and component class blocks. This keeps brand control and zero new dependencies. |

## Data Flow

`index.astro` → `Layout.astro` → `OrientationFunnel.astro`
`OrientationFunnel` → renders `Hero` / `QuizStep` / `LeadForm` / `ThankYou`
`QuizStep` uses `quizData.ts` + `validation.ts`
client script → `funnelState.ts` transitions → DOM rerender + focus handoff
lead submit → `buildSubmission()` → `lib/api/index.ts` → mock or real adapter → success/error state

State model:
- `currentStep`: `hero | quiz-1 | quiz-2 | quiz-3 | quiz-4 | quiz-5 | lead | thank-you`
- `answers`: `Record<QuestionId, { selected: string[]; otherText: string }>`
- `lead`: `{ fullName; whatsapp; email; consent }`
- `submission`: `{ status: 'idle' | 'submitting' | 'success' | 'error'; message?: string }`

Validation per step:
- Quiz steps: require selection; Q3 blocks a 4th choice; Q1/Q3 require `otherText` only when `Otro` is selected.
- Lead step: required `fullName`, required `whatsapp`, optional email regex, mandatory consent.
- Validation runs on Continue/Submit, clears field-level errors on input/change, and preserves prior answers on Back.

Accessibility/focus/error handling:
- Each step is a semantic `section`; after step change, focus moves to the section heading and a polite live region announces progress.
- Answer cards are real `button` controls; form fields use labels, `aria-describedby`, and error IDs.
- First invalid field receives focus on submit; submission errors render inline above the CTA; reduced-motion removes transitions.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/pages/index.astro` | Modify | Replace starter entry with funnel page shell. |
| `src/layouts/Layout.astro` | Modify | Spanish document metadata, title, favicon, global stylesheet import. |
| `src/components/OrientationFunnel.astro` | Create | Root funnel markup, live region, and client orchestration script. |
| `src/components/Hero.astro` | Create | Hero CTA section with approved copy hook points. |
| `src/components/QuizStep.astro` | Create | Single reusable question view with large answer cards and nav buttons. |
| `src/components/LeadForm.astro` | Create | Contact and consent form section with inline errors. |
| `src/components/ThankYou.astro` | Create | Confirmation step and WhatsApp CTA. |
| `src/components/ProgressIndicator.astro` | Create | 5-step progress UI with `aria-current`. |
| `src/lib/quizData.ts` | Create | Typed 5-question dataset and rule metadata. |
| `src/lib/funnelState.ts` | Create | Initial state, transitions, and payload builder. |
| `src/lib/validation.ts` | Create | Step validators and normalized error map. |
| `src/lib/api/types.ts` | Create | `FunnelSubmission`, `SubmissionResult`, adapter contract. |
| `src/lib/api/mock.ts` | Create | 600 ms mock submitter with console logging. |
| `src/lib/api/real.ts` | Create | POST adapter with timeout and structured errors. |
| `src/lib/api/index.ts` | Create | `PUBLIC_FUNNEL_API_URL` switch; exported `submitFunnel`. |
| `src/styles/global.css` | Create | Brand tokens, reset, layout, cards, forms, reduced-motion rules. |

## Interfaces / Contracts

```ts
export interface FunnelSubmission {
  academySlug: 'instituto-vision-accion';
  funnelSlug: 'via-orientation';
  contact: { fullName: string; whatsapp: string; email: string; consent: boolean };
  answers: Array<{ questionId: string; type: 'single' | 'multi'; selected: string[]; otherText?: string }>;
  metadata: { submittedAt: string; userAgent: string; referrer?: string; utm?: Record<string, string> };
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Validation and transition helpers | Type-safe manual fixtures via `astro check`; add Vitest later. |
| Integration | Full funnel progression and adapter switching | Manual browser QA with mock mode and env-enabled real mode. |
| E2E | Core conversion path on mobile + keyboard | Deferred follow-up; recommend Playwright smoke test once test tooling is allowed. |

## Migration / Rollout

No migration required. Suggested slices for the 400-line review budget: (1) shell + tokens + hero, (2) quiz data/state/progress, (3) lead form + thank-you + accessibility polish, (4) adapter wiring + manual QA notes. This should forecast chained PRs as **Yes** and keep each slice reviewable.

## Open Questions

- [ ] Should `metadata` include UTM/referrer fields now or only reserve optional keys?
- [ ] Will legal require a privacy-policy link near consent before go-live?

# public-funnel-submission-adapter Specification

## Purpose

Frontend submission contract and environment-swappable adapter boundary. Decouples the funnel UI from any specific backend endpoint so the UI can ship and be verified before the public API contract exists. The adapter exports a typed submission function; a mock implementation is the default.

## Requirements

### Requirement: Submission Contract

The system MUST define a `FunnelSubmission` type and a `submitFunnel` function with signature `(payload: FunnelSubmission) => Promise<SubmissionResult>`. The payload SHALL include: `academySlug`, `funnelSlug`, `contact` (fullName, whatsapp, email, consent), `answers` (array of `{ questionId, type, selected, otherText? }`), and `metadata` (submittedAt, userAgent). The result SHALL be `{ ok: boolean; submissionId?: string; error?: string }`.

#### Scenario: Submission payload matches contract

- GIVEN the funnel UI constructs a `FunnelSubmission` with all fields populated
- WHEN `submitFunnel` is called
- THEN the payload conforms to the type definition
- AND the contact object includes fullName, whatsapp, email, and consent

#### Scenario: Submission result shape

- GIVEN the adapter processes a submission
- WHEN the promise resolves
- THEN the result is an object with `ok: boolean`
- AND on success includes `submissionId: string`
- AND on failure includes `error: string`

---

### Requirement: Mock Adapter Behavior

The system MUST provide a mock implementation of `submitFunnel` that, when no real API URL is configured, simulates a 600 ms delay, logs the full payload to the browser console, and returns `{ ok: true, submissionId: 'mock-<timestamp>' }`. The mock SHALL NOT make any network request.

#### Scenario: Mock adapter returns success after delay

- GIVEN `PUBLIC_FUNNEL_API_URL` is not set
- WHEN `submitFunnel` is called with a valid payload
- THEN after approximately 600 ms the promise resolves with `{ ok: true, submissionId: 'mock-...' }`
- AND no HTTP request is made

#### Scenario: Mock adapter logs payload

- GIVEN the mock adapter is active
- WHEN `submitFunnel` is called
- THEN the full `FunnelSubmission` payload is logged to the browser console
- AND the log includes contact, answers, and metadata fields

---

### Requirement: Environment-Driven Switching

The system MUST select the adapter implementation based on the presence of `import.meta.env.PUBLIC_FUNNEL_API_URL`. When the variable is absent, the mock adapter SHALL be used. When present, the real adapter that posts to the configured URL SHALL be used. The UI components SHALL import only the adapter type and the configured implementation; they SHALL NOT contain switching logic.

#### Scenario: Mock selected when URL is absent

- GIVEN the environment variable `PUBLIC_FUNNEL_API_URL` is not set
- WHEN the application loads
- THEN `submitFunnel` resolves to the mock implementation
- AND no environment detection code exists in UI components

#### Scenario: Real adapter selected when URL is present

- GIVEN `PUBLIC_FUNNEL_API_URL` is set to a valid HTTPS URL
- WHEN `submitFunnel` is called
- THEN the real adapter sends a POST request to the configured URL
- AND the mock adapter is bypassed

---

### Requirement: Error State Handling

The adapter SHALL surface errors in a structured `SubmissionResult` with `ok: false` and a user-facing `error` message. Network failures, timeouts, and non-2xx responses SHALL all produce `ok: false`. The adapter SHALL NOT throw unhandled exceptions; all error paths SHALL resolve through the promise.

#### Scenario: Network failure returns structured error

- GIVEN the real adapter is active and the network is unavailable
- WHEN `submitFunnel` is called
- THEN the promise resolves with `{ ok: false, error: "..." }`
- AND no unhandled exception is thrown

#### Scenario: Timeout returns error

- GIVEN the real adapter is active and the request exceeds 10 seconds
- WHEN the timeout fires
- THEN the promise resolves with `{ ok: false, error: "..." }`

---

### Requirement: Non-Goals

The adapter SHALL NOT perform scoring, answer categorization, lead qualification, or any business logic beyond transport and serialization. The adapter SHALL NOT couple to internal SaaS lead models (`Lead`, `Course`, `Tenant`). The adapter SHALL NOT require authentication tokens or session state.

#### Scenario: Adapter is a pure transport layer

- GIVEN any `FunnelSubmission` payload
- WHEN the adapter processes it
- THEN no answer scoring or categorization occurs
- AND no internal SaaS entity types are referenced

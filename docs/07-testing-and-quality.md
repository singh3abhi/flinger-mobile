# 07 — Testing & Quality

Status: Draft v0.1

## 1. Pyramid

| Level | Scope | Tools | When |
|---|---|---|---|
| **Static** | Types, lint, boundaries, i18n keys, hex/size literal bans | `tsc`, ESLint, `eslint-plugin-boundaries`, custom rules | Every PR |
| **Unit** | Pure utils, zod schemas, stores, hooks (`renderHook`), session-manager logic (refresh dedupe, rotation) | Jest | Every PR |
| **Component** | `shared/ui` and screens with mocked API (MSW), states: loading / error / empty / success | Jest + React Native Testing Library + MSW | Every PR |
| **Contract** | Generated client vs real backend staging (smoke) | Script hitting staging with a test account | Nightly + before release |
| **E2E** | Critical journeys on real simulators/emulators | **Maestro** flows in `e2e/` | Before store release; nightly on staging build |
| **Manual / exploratory** | Real devices, poor networks, interruptions | Checklist | Each release |

Coverage is **reported, not gated** at a global %; reviewers require tests for new logic and bug fixes. Critical modules (`core/auth`, `core/realtime`, outbox, swipe-queue) target high branch coverage.

## 2. Must-have tests (by feature)

- **Auth/session:** concurrent 401s trigger exactly one refresh; refresh rotation persists the new token; refresh failure → `signedOut` and cache reset; cold start state machine transitions.
- **Forms:** zod validation messages; server `errors[].path` mapped to fields.
- **Discovery:** deck prefetch threshold; optimistic swipe + retry on failure (same `requestId`); match response opens modal and invalidates queries.
- **Chat:** optimistic send → ack reconciliation; de-dupe by `messageId`; outbox flush order after reconnect; gap-fill merge.
- **Onboarding:** draft persisted and resumed after process kill.
- **Update gate:** `426 APP_UPDATE_REQUIRED` shows the blocking screen.

## 3. E2E flows (Maestro)

1. Fresh install → sign-in (test OTP from a staging-only fixed code for allow-listed numbers) → onboarding → discover
2. Swipe like → match (with a seeded counterpart) → chat → send message
3. Receive push-tap deep link → opens conversation
4. Block / report from a profile and from chat
5. Account delete

Staging backend exposes **test phone numbers with a fixed OTP** (guarded by environment + allow-list) so E2E runs without SMS — never enabled in production.

## 4. Quality budgets (initial targets)

| Area | Budget |
|---|---|
| Cold start to interactive (mid-tier Android) | < 2.5 s |
| Swipe interaction | 60 fps on a mid-tier device; no dropped frames during card drag |
| JS bundle (Hermes bytecode) | track per PR; fail PR on > +10 % without justification |
| Image memory | Prefetch ≤ 3 cards ahead; recycle list items; no unbounded caches |
| Crash-free sessions | ≥ 99.5 % (Sentry), release-gated rollout |
| App size | track IPA/AAB size per release; compress video/assets |
| Accessibility | All interactive elements labeled; AA contrast for body text; usable at 130 % font scale; screen-reader pass on critical flows |

Measure with React Native DevTools / Flipper-equivalents, Xcode Instruments, Android Studio profiler, and Sentry performance.

## 5. Lint & formatting rules (highlights)

- `no-console` (allow via `logger` wrapper), `no-restricted-imports` for `core/api/generated` outside feature hooks, boundary rules per [architecture](01-architecture.md)
- No hex colors, no raw `fontSize`/magic numbers in `app/` and `src/features/`
- No hard-coded user-facing strings (i18n lint)
- `react-hooks/exhaustive-deps` as error
- Prettier + `eslint-config-expo`

## 6. Git & review conventions

- Conventional commits; PR template with: summary, screenshots (before/after), test plan, a11y/i18n checklist, API drift status
- 1 approving review (self-review OK while solo — keep the PR trail), required checks green, squash-merge
- Feature flags (`useFlag`) for work that must merge before it's shippable

## 7. Observability in app

- **Sentry** (`@sentry/react-native`): crashes, JS errors, performance traces for startup and key screens, release + dist tagged; PII scrubbing (no phone numbers, message text)
- **Analytics** (decision pending: PostHog vs Firebase Analytics): funnel events only — `signup_started`, `otp_verified`, `onboarding_completed`, `first_swipe`, `first_match`, `first_message_sent`. Events never contain message content or exact location.
- Breadcrumbs include request ids to correlate with backend logs.

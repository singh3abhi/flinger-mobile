# ADR-0002 — Expo Router for navigation

**Status:** Proposed · 2026-10-25

## Decision
Use **Expo Router** (file-based routing on React Navigation) with route groups `(auth)`, `(onboarding)`, `(app)/(tabs)`. Route files stay thin ([architecture](../01-architecture.md)); auth/onboarding gating is done once in the root layout from the auth state machine.

## Consequences
- ✅ Deep links and typed routes come with the file structure; push-notification deep links map naturally to routes.
- ✅ Familiar mental model for anyone who knows Next.js (relevant for the future web app).
- ⚠️ Route files are a second place where structure lives → rule: no logic in `app/`.

## Alternatives
Plain React Navigation (more manual wiring), React Native Navigation/Wix (native stacks, more setup).

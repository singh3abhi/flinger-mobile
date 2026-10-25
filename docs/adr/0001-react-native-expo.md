# ADR-0001 — React Native with Expo

**Status:** Accepted · 2026-10-25

## Context
A Flutter prototype exists on the `abhinav` branch (~9k lines / 100 files: auth, an 11-step profile-completion questionnaire, a swipe deck with a mock repository, 5-tab shell). It is UI + local state only — no backend integration. A web app (Next.js) follows the mobile launch, and the backend is TypeScript (NestJS).

## Decision
Build the production app in **React Native with Expo** (dev client + prebuild/CNG, EAS for builds and updates). The Flutter app is a **visual reference** for the port, not a code base to evolve.

## Consequences
- ✅ TypeScript everywhere: same language as backend; Zod schemas / OpenAPI-generated types flow to the app and later the web app.
- ✅ A real web app path (Next.js) with SEO, instead of Flutter Web.
- ✅ EAS Update (OTA) for JS-only fixes; large hiring pool; mature ecosystem for push, video, gestures.
- ⚠️ UI must be rebuilt: more than first estimated (~9k Dart lines, though much is Bloc state and widget boilerplate that doesn't port) — see [migration plan](../04-flutter-migration.md).
- ⚠️ Swipe-deck smoothness needs deliberate work (Reanimated worklets, image prefetching) — profiled in M5.
- ⚠️ Native module/SDK upgrade churn — mitigated by CNG, pinned SDK, dedicated upgrade PRs.

## Alternatives
Continue with Flutter (single codebase incl. web, but Dart-only, weaker web/SEO and no type sharing); native Swift/Kotlin (best performance, double the work).

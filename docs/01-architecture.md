# 01 — Mobile Architecture

Status: Draft v0.1 · Related ADRs: [0001](adr/0001-react-native-expo.md), [0002](adr/0002-expo-router.md), [0005](adr/0005-generated-api-client.md)

## 1. Style

**Feature-first, layered, with thin routes.** Business capability lives in `features/*`; reusable UI in `shared/`; app-wide infrastructure in `core/`; Expo Router files in `app/` only compose screens. TypeScript `strict`, no implicit `any`.

## 2. Repository layout (target)

```
flinger-mobile/
├── app/                           # Expo Router — ROUTES ONLY (thin)
│   ├── _layout.tsx                # providers, auth gate, fonts, splash control
│   ├── (auth)/                    # landing, sign-in (phone/OTP), verify
│   ├── (onboarding)/              # profile steps, photos, preferences, permissions
│   ├── (app)/
│   │   ├── (tabs)/                # discover · matches · chats · profile
│   │   └── chat/[conversationId].tsx
│   └── +not-found.tsx
│
├── src/
│   ├── features/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── profile/
│   │   ├── discovery/             # swipe deck
│   │   ├── matches/
│   │   ├── chat/
│   │   ├── safety/                # block, report
│   │   └── settings/
│   │       └── (each feature, see §3)
│   │
│   ├── shared/
│   │   ├── ui/                    # design-system components (Button, TextField, Avatar, Sheet…)
│   │   ├── hooks/                 # generic hooks (useAppState, useKeyboard…)
│   │   ├── lib/                   # pure utils (date, format, guards)
│   │   └── constants/
│   │
│   ├── core/                      # app-wide infrastructure; knows nothing about features
│   │   ├── api/                   # generated/ (never hand-edit) + http client + interceptors
│   │   ├── auth/                  # session manager: token storage, refresh, auth store
│   │   ├── realtime/              # socket manager
│   │   ├── notifications/         # permission + token registration + handlers
│   │   ├── config/                # env, build info, remote config (/v1/config)
│   │   ├── i18n/                  # i18next setup + locale JSON
│   │   ├── theme/                 # tokens.ts + tailwind preset + nativewind setup
│   │   ├── storage/               # secure-store + MMKV wrappers
│   │   ├── monitoring/            # Sentry, analytics
│   │   └── providers/             # QueryClient, Theme, Toast, etc.
│   └── types/
├── assets/                        # fonts, images, video, icons (lowercase paths!)
├── e2e/                           # Maestro flows
├── scripts/                       # api:sync, tokens, release helpers
└── docs/
```

## 3. Inside a feature

```
src/features/discovery/
├── components/        # presentational pieces: SwipeCard, ActionBar, EmptyDeck
├── screens/           # screen components used by app/ route files
├── hooks/             # useDeck, useSwipe… (compose queries/mutations + local logic)
├── store/             # zustand slice — ONLY for client state owned by this feature
├── schemas/           # form/validation schemas (zod)
├── utils/             # pure helpers
└── index.ts           # PUBLIC API — only what other layers may import
```

## 4. Dependency rules (enforced by lint)

```
app/  ──►  features/*  ──►  shared/  ──►  core/
                 └──────────────────────►  core/
```

1. `app/` contains no logic: a route file renders one screen from `features/*` and declares route options.
2. A feature **never imports another feature's internals**. Cross-feature needs go through that feature's `index.ts`, or better, through `shared/` or `core/` (e.g. `auth` state lives in `core/auth` because everything depends on it).
3. `shared/` and `core/` **never import from `features/`**.
4. `core/api/generated` is only imported by `features/*/hooks` and `core/api` itself — **components never call the API or generated hooks directly**; they use feature hooks.
5. Enforced with `eslint-plugin-boundaries` (or `dependency-cruiser`) in CI.

## 5. Component rules

| Kind | Rule |
|---|---|
| Screen | Wires hooks to presentational components; handles loading / error / empty states explicitly |
| Presentational component | Props in, UI out. No data fetching, no navigation side effects (callbacks only) |
| Hook (`useXxx`) | Where logic lives: queries, mutations, derived state, effects. Unit-testable with `renderHook` |
| `shared/ui` component | Styled only via design tokens; accessible by default (labels, roles, hit targets ≥ 44 pt); has a documented prop API |
| Styles | NativeWind classes with token-backed names; no magic numbers/hex in components ([design system](03-design-system.md)) |

## 6. Cross-cutting conventions

- **Naming:** files `kebab-case.tsx` (components `PascalCase` exports), hooks `use-xxx.ts`, one exported component per file.
- **Imports:** path aliases `@/app`, `@/features/*`, `@/shared/*`, `@/core/*`; no deep relative `../../..`.
- **Strings:** every user-facing string via i18n keys from day one (the Flutter prototype used many hard-coded strings — see [migration](04-flutter-migration.md)). Error text comes from `errors.<CODE>` keys mapped from the API's problem `code`.
- **Env/config:** only through `core/config` (typed). Public vars use `EXPO_PUBLIC_*`; **no secrets in the app bundle** (anything shipped is public).
- **Logging:** a thin `logger` wrapper (no `console.log` in committed code; stripped in production); never log tokens, phone numbers or message content.
- **Errors:** every screen has an error boundary path; API errors are normalized in `core/api` to `AppError { code, message, retryable }`.
- **Performance defaults:** `FlashList` for long lists; `expo-image` with blurhash/placeholder for photos and proper cache policy; memoize list items; animations on the UI thread (Reanimated worklets); avoid inline object/array props in hot paths.
- **Accessibility defaults:** `accessibilityLabel`/`role` on interactive elements, dynamic type respected, contrast checked against tokens ([design system](03-design-system.md)), reduce-motion honoured.
- **Navigation:** auth/onboarding gating happens **once**, in the root layout (see [state](02-state-management.md#auth-state-machine)); screens never redirect ad hoc.

## 7. Platform & native config

- Expo **prebuild (CNG)**: `ios/` and `android/` are generated and **not committed** (`.gitignore`); native config lives in `app.config.ts` + config plugins. This keeps upgrades cheap.
- A **development client** (not Expo Go) is used from the start, because push, secure-store, video, and camera/location features require native modules.
- **Identifiers:** the Flutter prototype used placeholder `com.example.*` ids. Choose real, permanent ids (e.g. `app.flinger.mobile`) **before the first store build** — they cannot be changed later. Record the decision in an ADR.
- Firebase: the existing project (from the Flutter `firebase_options.dart`) can be reused, but **new iOS/Android app registrations** with the final bundle ids are required; `google-services.json` / `GoogleService-Info.plist` are provided to builds as EAS file secrets, never committed.

## 8. Definition of done (per PR)

- Types, lint (incl. boundaries), unit/component tests green
- New UI: states covered (loading, error, empty, offline), a11y labels, i18n keys, tested at small and large font scale
- No hard-coded colors/sizes/strings; no direct API calls from components
- API usage via generated client; `pnpm api:sync` drift check clean
- Screenshots in the PR for visual changes (compare to reference during migration)

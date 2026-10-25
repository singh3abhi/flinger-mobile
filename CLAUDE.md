# CLAUDE.md — flinger-mobile

Guidance for Claude Code (and humans) working in this repo.

## State
Feature 1 (email OTP sign-in, session resume, sign-out) is built and verified on the iOS simulator against the local backend. Read `docs/README.md`, then `docs/01-architecture.md` and `docs/02-state-management.md` before writing code. The master product scope, system design, roadmap and the **open-questions log** (`docs/15-discussion-log.md`) are canonical in `../flinger-backend/docs/`.

Stack in use: Expo SDK 58 (Expo Go), React Native 0.88, React 19.3, Expo Router (routes in `src/app`), React Compiler, TanStack Query, Zustand, `openapi-fetch` + `openapi-typescript`, `expo-secure-store`, i18next, jest-expo.

## Fixed decisions (do not relitigate)
React Native + Expo (TypeScript strict) · separate repos (`flinger-backend` is the API) · OpenAPI is the contract. Current choices are in `docs/adr/`: StyleSheet on typed tokens (0007; NativeWind deferred) and openapi-fetch (0008; replaces orval).

## Rules
- Layering: `app/` (thin routes) → `src/features/*` → `src/shared` → `src/core`. Features never import another feature's internals; `shared`/`core` never import `features`. Enforced by lint.
- Components never call the API or `core/api/generated` directly — use feature hooks.
- **State:** server data lives only in TanStack Query; client state in small Zustand slices (always with selectors); forms in React Hook Form + Zod. Never mirror query data into Zustand. Tokens only in `expo-secure-store` (refresh) / memory (access), never in Zustand/AsyncStorage/MMKV.
- Realtime events write into the Query cache; UI reads from the cache. De-duplicate by `messageId`; sends are idempotent via `clientMsgId`.
- Styling only via design tokens (`src/core/theme/tokens.ts` + `src/shared/ui` primitives). No hex colors or raw font sizes in `src/app/` or `src/features/`.
- All user-facing strings via i18n keys; map API errors by `code`, never by message text.
- No `console.log` (use the logger wrapper); never log tokens, phone numbers, or message text.
- No secrets in the repo or bundle; `EXPO_PUBLIC_*` is public by definition.
- Do **not** port the Flutter prototype's bugs (`docs/04-flutter-migration.md` §5). Port intent and visuals; verify with reference screenshots.
- Generated API client is never hand-edited; run `pnpm api:sync` and commit the diff.
- When a decision changes, add/supersede an ADR instead of editing history.

## Commands
```bash
pnpm install
cp .env.example .env     # EXPO_PUBLIC_API_URL=http://localhost:4000
pnpm api:sync            # copy ../flinger-backend/openapi/openapi.json and regenerate src/core/api/schema.d.ts
pnpm start               # Expo dev server; `pnpm ios` opens it in Expo Go on the simulator
pnpm test                # jest-expo unit tests
pnpm typecheck
```
Backend for local runs: `docker compose up -d` and `pnpm build && node dist/main.api.js` in `../flinger-backend`. OTP emails go to Mailpit (http://localhost:8025).

Notes:
- `npx expo install` can hang here; add packages with `CI=true pnpm add <pkg>@<sdk-compatible version>` instead.
- Simulator automation: the text tool drops characters when it types long strings faster than a controlled `TextInput` can keep up; type in short chunks. Simulator screenshots can lag 1–2 s behind the UI; wait before trusting one.

## Legacy
`../flinger-flutter` is the visual reference (assets, copy, tokens, flows) — read-only. **Use the remote branch `origin/abhinav`** (latest, ~9k lines, full onboarding questionnaire + swipe UI); `main`/`prod` are stale. Option ids live in `lib/core/constants/profile_mappings.dart`. Fonts there are referenced as `assets/fonts/inter/` but live in `assets/fonts/Inter/`; use a lowercase path here.

## Git
Repos under `~/Development/Personal` use the personal SSH key and `abhinavsinghdeveloper@gmail.com` automatically (git `includeIf`). Conventional commit messages. **Work on `uat-release`** (the integration branch; merges deploy to UAT). Small, focused commits; open PRs against `uat-release`.

# CLAUDE.md — flinger-mobile

Guidance for Claude Code (and humans) working in this repo.

## State
Planning only — **no code scaffolded yet**. The source of truth is `docs/`. Read `docs/README.md`, then `docs/01-architecture.md` and `docs/02-state-management.md` before writing code. The master product scope, system design and roadmap are canonical in `../flinger-backend/docs/`.

## Fixed decisions (do not relitigate)
React Native + Expo (TypeScript strict) · separate repos (`flinger-backend` is the API) · OpenAPI is the contract. Proposed items (Expo Router, TanStack Query + Zustand, NativeWind, generated client) are in `docs/adr/` — treat as the default unless the owner changes them.

## Rules
- Layering: `app/` (thin routes) → `src/features/*` → `src/shared` → `src/core`. Features never import another feature's internals; `shared`/`core` never import `features`. Enforced by lint.
- Components never call the API or `core/api/generated` directly — use feature hooks.
- **State:** server data lives only in TanStack Query; client state in small Zustand slices (always with selectors); forms in React Hook Form + Zod. Never mirror query data into Zustand. Tokens only in `expo-secure-store` (refresh) / memory (access), never in Zustand/AsyncStorage/MMKV.
- Realtime events write into the Query cache; UI reads from the cache. De-duplicate by `messageId`; sends are idempotent via `clientMsgId`.
- Styling only via design tokens (NativeWind classes). No hex colors, raw font sizes or magic numbers in `app/` or `src/features/`.
- All user-facing strings via i18n keys; map API errors by `code`, never by message text.
- No `console.log` (use the logger wrapper); never log tokens, phone numbers, or message text.
- No secrets in the repo or bundle; `EXPO_PUBLIC_*` is public by definition.
- Do **not** port the Flutter prototype's bugs (`docs/04-flutter-migration.md` §5). Port intent and visuals; verify with reference screenshots.
- Generated API client is never hand-edited; run `pnpm api:sync` and commit the diff.
- When a decision changes, add/supersede an ADR instead of editing history.

## Commands (available after mobile roadmap M1)
```bash
pnpm install
pnpm api:sync            # regenerate client from backend OpenAPI release
pnpm start               # Expo dev server (dev client)
pnpm test                # unit + component tests
pnpm lint && pnpm typecheck
eas build --profile development --platform ios   # dev client build
```

## Legacy
`../flinger-flutter` is the visual reference (assets, copy, tokens, flows) — read-only. **Use the remote branch `origin/abhinav`** (latest, ~9k lines, full onboarding questionnaire + swipe UI); `main`/`prod` are stale. Option ids live in `lib/core/constants/profile_mappings.dart`. Fonts there are referenced as `assets/fonts/inter/` but live in `assets/fonts/Inter/`; use a lowercase path here.

## Git
Repos under `~/Development/Personal` use the personal SSH key and `abhinavsinghdeveloper@gmail.com` automatically (git `includeIf`). Conventional commit messages. **Work on `uat-release`** (the integration branch; merges deploy to UAT). Small, focused commits; open PRs against `uat-release`.

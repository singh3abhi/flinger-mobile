# Flinger Mobile

The iOS + Android app for **Flinger** — a dating app ("Flings, Love & Stories"). Built with **React Native (Expo)** and TypeScript.

> **Status:** in development on `uat-release`. Feature 1 (email OTP sign-in, session resume, sign-out) is done; onboarding/profile is next. The plan lives under [`docs/`](docs/README.md).

## Stack

| Concern | Choice |
|---|---|
| Framework | React Native + **Expo** (dev client / prebuild), TypeScript strict |
| Navigation | Expo Router (file-based) |
| Server state | TanStack Query |
| Client state | Zustand |
| Forms | React Hook Form + Zod |
| Styling | `StyleSheet` on typed design tokens (NativeWind deferred, ADR-0007) |
| API | `openapi-fetch` typed from the backend's OpenAPI contract (ADR-0008) |
| Realtime | socket.io-client |
| Builds & releases | EAS Build / Submit / Update, GitHub Actions |

Backend: [`flinger-backend`](https://github.com/singh3abhi/flinger-backend) (NestJS, Postgres, Redis). Product scope, system design and the master roadmap are **canonical in the backend repo** (`docs/00-product-and-scope.md`, `docs/01-system-design.md`, `docs/09-roadmap.md`).

## Repo family
| Repo | Purpose |
|---|---|
| `flinger-mobile` (this repo) | Expo / React Native app |
| `flinger-backend` | API, realtime, workers |
| `flinger-web` *(later)* | Next.js web client |
| `flinger-flutter` | **Legacy** Flutter UI prototype — source for the UI port ([migration plan](docs/04-flutter-migration.md)) |

## Where to start
1. [Architecture](docs/01-architecture.md) — folder structure and dependency rules
2. [State management](docs/02-state-management.md) — what goes where
3. [Design system](docs/03-design-system.md) — tokens, components, accessibility
4. [Flutter → RN migration](docs/04-flutter-migration.md) — screen inventory and parity checklist
5. [Roadmap](docs/08-roadmap.md)

## Local development

```bash
pnpm install
cp .env.example .env            # EXPO_PUBLIC_API_URL=http://localhost:4000
pnpm api:sync                   # refresh API types from ../flinger-backend/openapi/openapi.json
pnpm ios                        # Expo dev server + Expo Go on the iOS simulator
pnpm test && pnpm typecheck
```

Run the backend first (see `flinger-backend` README); sign-in codes arrive in Mailpit at http://localhost:8025.

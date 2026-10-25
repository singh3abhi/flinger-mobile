# Architecture Decision Records (mobile)

One page per significant decision. To change a decision, add a new ADR that **supersedes** the old one.

Status values: **Accepted** (owner decided) · **Proposed** (recommended, awaiting owner confirmation) · **Open** (decision needed) · **Superseded by NNNN**.

| ADR | Title | Status |
|---|---|---|
| [0001](0001-react-native-expo.md) | React Native with Expo | Accepted |
| [0002](0002-expo-router.md) | Expo Router for navigation | Accepted (in use) |
| [0003](0003-state-tanstack-query-zustand.md) | TanStack Query + Zustand (+ React Hook Form) | Accepted (in use) |
| [0004](0004-nativewind-design-tokens.md) | NativeWind on a single design-token source | Superseded by 0007 (for now) |
| [0005](0005-generated-api-client.md) | API client generated from OpenAPI (orval) | Superseded by 0008 |
| [0006](0006-bundle-identifiers.md) | Permanent app / bundle identifiers | Open |
| [0007](0007-stylesheet-typed-tokens.md) | StyleSheet on typed design tokens (NativeWind deferred) | Accepted (in use) |
| [0008](0008-openapi-fetch-client.md) | Typed client with openapi-typescript + openapi-fetch | Accepted (in use) |

Cross-repo decisions (separate repos, Postgres, NestJS, auth model…) are in `flinger-backend/docs/adr/`.

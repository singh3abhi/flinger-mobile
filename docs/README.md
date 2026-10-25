# Flinger Mobile — Documentation Index

Last updated: 2026-10-25 · Status: **Draft v0.1**

| # | Doc | Answers |
|---|---|---|
| 01 | [Architecture](01-architecture.md) | Folder layout, layering and dependency rules, conventions |
| 02 | [State management](02-state-management.md) | Server vs client vs form vs realtime state; auth state machine |
| 03 | [Design system](03-design-system.md) | Tokens extracted from the Flutter app, components, accessibility |
| 04 | [Flutter → RN migration](04-flutter-migration.md) | Screen inventory, widget mapping, parity checklist, UX changes |
| 05 | [API client & realtime](05-api-client-and-realtime.md) | OpenAPI codegen, auth refresh, errors, sockets, push |
| 06 | [CI/CD & releases](06-cicd-and-releases.md) | EAS, environments, OTA updates, store releases |
| 07 | [Testing & quality](07-testing-and-quality.md) | Test pyramid, lint, performance and a11y budgets |
| 08 | [Roadmap](08-roadmap.md) | Mobile milestones sequenced against the backend phases |
| — | [ADRs](adr/README.md) | One page per significant decision |

## Cross-repo canonical docs (in `flinger-backend/docs/`)

- `00-product-and-scope.md` — what v1 is and is not, assumptions A1–A6
- `01-system-design.md` — overall system and flows
- `04-api-and-contracts.md` — API conventions, error format, versioning (the client consumes this)
- `06-discovery-matching-chat.md` — behavior the swipe and chat UIs implement
- `09-roadmap.md` — master phase plan

Status labels: `Accepted` (owner decided) · `Proposed` (recommended, awaiting confirmation) · `Assumed`.

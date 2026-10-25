# ADR-0005 — API client generated from OpenAPI

**Status:** Proposed · 2026-10-25

## Decision
Generate types, fetchers, React Query hooks and Zod schemas with **orval** from the backend's released `openapi.json`. `pnpm api:sync` updates `src/core/api/generated/` and `api/openapi.lock`; generated code is committed and never edited; CI fails on drift. Components never use generated code directly — only feature hooks do. See [API client](../05-api-client-and-realtime.md).

## Consequences
- ✅ Contract changes surface as type errors at compile time; no hand-maintained duplicate types.
- ✅ Zod schemas from the spec keep client validation aligned with the server.
- ⚠️ Generated diffs can be noisy — reviewed alongside the spec version bump.
- ⚠️ Depends on the backend publishing a clean spec (enforced by `oasdiff` in backend CI).

## Alternatives
`openapi-typescript` + `openapi-fetch` (lighter, no hooks/zod; good fallback), hand-written client (drift-prone), tRPC (requires a shared TS monorepo — rejected with the repo split).

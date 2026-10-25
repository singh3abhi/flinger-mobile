# ADR-0008 — Typed client with openapi-typescript + openapi-fetch

**Status:** Accepted (in use) · 2026-10-25 · Supersedes [0005](0005-generated-api-client.md)

## Decision
- `pnpm api:sync` copies the backend's committed contract (`../flinger-backend/openapi/openapi.json`) to `src/core/api/openapi.json` and generates **types only** (`src/core/api/schema.d.ts`) with `openapi-typescript`.
- Requests go through `openapi-fetch` (`createClient<paths>`), wrapped by `createAuthFetch`. The wrapper adds the client headers, attaches the access token, and on a 401 refreshes once (shared in-flight) and retries.
- Each feature's `api.ts` holds thin functions over the client; feature hooks wrap them with TanStack Query. Components never call the client.
- Generated files are committed and never hand-edited.

## Why not orval (ADR-0005)
- orval generates fetchers, hooks and Zod schemas, a lot of code to review on each contract change. Its hooks also hard-code the query keys and invalidation we want to own per feature.
- `openapi-fetch` is about 6 kB, has no runtime codegen, and still turns a contract change into a compile error: paths, params, bodies and responses are all typed from `paths`.

## Consequences
- ✅ Small, stable, readable; contract drift shows up as `tsc` errors.
- ⚠️ No generated Zod schemas on the client. Form validation uses small hand-written Zod schemas, and the server stays the authority.
- ⚠️ Query hooks are written by hand (intentional: keys and invalidation live with the feature).

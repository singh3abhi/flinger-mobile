# ADR-0003 — TanStack Query + Zustand (+ React Hook Form)

**Status:** Proposed · 2026-10-25

## Decision
- **Server state:** TanStack Query (the cache is the only place API data lives)
- **Client state:** Zustand slices (auth status, swipe deck queue, onboarding draft, UI)
- **Forms:** React Hook Form + Zod
- **Realtime:** sockets write into the Query cache; UI reads from the cache
Details and rules in [state management](../02-state-management.md).

## Consequences
- ✅ Caching, retries, pagination, optimistic updates without hand-rolled reducers; minimal boilerplate.
- ✅ Clear rule per state kind → fewer sync bugs than a single global store.
- ⚠️ Team must resist mirroring query data into Zustand (documented anti-pattern, review rule).
- The Flutter prototype used Bloc; there is no state code worth porting (one small sign-up bloc).

## Alternatives
Redux Toolkit + RTK Query (heavier, fine), MobX/Jotai (less standard for server state), Context-only (re-render and caching problems).

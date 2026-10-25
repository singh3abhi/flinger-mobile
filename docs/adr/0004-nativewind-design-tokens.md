# ADR-0004 — NativeWind on a single design-token source

**Status:** Proposed · 2026-10-25

## Decision
Style with **NativeWind** (Tailwind classes in React Native). All values come from `src/core/theme/tokens.ts`, which feeds the Tailwind preset; semantic roles (`bg-brand`, `text-on-brand`) instead of raw colors. The token file is reused by `flinger-web` later (copied; extract to a package only if it drifts). See [design system](../03-design-system.md).

## Consequences
- ✅ Fast to write, consistent, and the same class vocabulary can be used on the Next.js web app.
- ✅ Lint rules can ban hex/px literals because everything has a token.
- ⚠️ NativeWind/Tailwind-for-RN is a layer on top of RN styles — keep an eye on version compatibility with Expo SDK upgrades.
- ⚠️ Complex animated styles still use Reanimated styles directly.

## Alternatives
`StyleSheet` + a theme hook (no extra dependency, more boilerplate, no web reuse), Tamagui (true shared components with web, heavier setup/learning curve), Unistyles (fast, RN-only).

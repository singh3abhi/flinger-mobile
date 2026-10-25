# ADR-0007 — StyleSheet on typed design tokens (NativeWind deferred)

**Status:** Accepted (in use) · 2026-10-25 · Supersedes [0004](0004-nativewind-design-tokens.md) for now

## Decision
Style with React Native `StyleSheet` and the typed tokens in `src/core/theme/tokens.ts` (colors, fonts, typography, spacing, radius, `HIT`). Shared primitives (`Text`, `Button`, `TextField`, `OtpInput`, `Screen`, `RoundButton`, `HardShadow`) in `src/shared/ui` own the visual rules; feature screens compose them and only use tokens for layout tweaks.

## Why now
- NativeWind for Expo SDK 58 / React Native 0.88 / React 19.3 needs its own Babel/Metro setup and adds a compiler layer that is one more thing to break on each SDK upgrade. We are shipping Phase 0 fast.
- `StyleSheet` plus typed tokens already gives one source of truth, and TypeScript rejects unknown token names.

## Consequences
- ✅ No extra dependency or build step; nothing extra to debug in Expo Go.
- ✅ The token file stays portable to `flinger-web` (plain TS object).
- ⚠️ More boilerplate than utility classes.
- ⚠️ No class vocabulary shared with the web app. Revisit when `flinger-web` starts (see backend `docs/15-discussion-log.md`).

## Migration path
Tokens are already the single source. Moving to NativeWind later means feeding `tokens.ts` into a Tailwind preset and migrating screens one at a time; both systems can coexist.

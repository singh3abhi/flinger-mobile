# 03 — Design System

Status: Draft v0.1 · Related: [ADR-0004](adr/0004-nativewind-design-tokens.md)

The Flutter prototype is the **visual source of truth** for the first release. This doc extracts its tokens, defines how they become a typed token set shared by NativeWind (and later the web app), and records the accessibility findings we will fix during the port.

## 1. Principles

1. **Tokens, not literals.** No hex values, font sizes or spacing numbers in components — only token-backed classes/props.
2. **Semantic over raw.** Components use roles (`bg-brand`, `text-on-brand`), not colors (`bg-orange`). Roles let us add light/dark or rebrand without touching components.
3. **One definition, many consumers.** `src/core/theme/tokens.ts` is the single source; the Tailwind/NativeWind preset and any runtime style code import it. The same file is copied into `flinger-web` when it exists (extract to a package only if it starts to drift — [ADR-0001 backend](https://github.com/singh3abhi/flinger-backend/blob/main/docs/adr/0001-separate-repos-openapi-contract.md)).
4. **Accessible by default.** Contrast, hit targets, dynamic type and reduce-motion are properties of the components, not per-screen chores.

## 2. Tokens extracted from the Flutter app

Source: `flinger-flutter/lib/core/theme/app_colors.dart`, `app_text_styles.dart`, and the shared widgets.

### 2.1 Colors (raw palette)

| Flutter name | Hex | Observed use |
|---|---|---|
| `primaryColor` | `#FF4000` | Brand/CTA; **full-screen background** on sign-up, sign-in and permission screens; headline text on landing |
| `whiteColor` | `#FFFFFF` | Text on brand background; primary button fill; icon-button fill; splash background |
| `blackColor` | `#000000` | Text on white buttons |
| `charcoal` | `#121212` | Dark base (defined, not yet widely used) |
| `surface` | `#1C1C1E` | Dark surface (defined, not yet widely used) |
| `textPrimary` | `#FFFFFF` | Text on dark |
| `textSecondary` | `#B5B5B5` | Secondary text on dark |
| `textMuted` | `#8E8E93` | Muted text |
| `border` | `#2C2C2E` | Dividers/borders on dark |

### 2.2 Proposed semantic roles (initial mapping)

| Role | Value | Notes |
|---|---|---|
| `brand` | `#FF4000` | |
| `on-brand` | `#000000` for body-size text; `#FFFFFF` only for ≥ 24 px / bold ≥ 18.66 px | See contrast table — white-on-brand fails AA for normal text |
| `bg-base` | `#FFFFFF` (light) / `#121212` (dark) | |
| `bg-surface` | `#FFFFFF` / `#1C1C1E` | |
| `text-primary` | `#121212` / `#FFFFFF` | |
| `text-secondary` | `#B5B5B5` (dark) — light value TBD in design pass | |
| `text-muted` | `#8E8E93` | |
| `border` | `#2C2C2E` (dark) — light value TBD | |
| `danger` / `success` / `warning` | **to be defined** — the prototype has no error color (its error text had no color set) | |

The prototype is effectively a single brand-colored theme. **Light/dark theming is not required for v1**; the semantic naming makes it possible later. Missing light-theme values are marked TBD on purpose — decide in the design pass rather than inventing them now.

### 2.3 Typography

- **Family:** Inter, weights **300 / 400 / 500 / 600 / 700 / 800** (Light … ExtraBold).
- **Sizes defined in the prototype (px):** 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 22, 24, 26, 28, 30, 32, 34, 36, 42, 50, 52. **Sizes actually used on current screens:** 12, 13, 14, 15, 16, 30, 32, 36, 42.
- **Line heights (multiplier):** 1.00, 1.20, 1.35, 1.40, 1.50, 1.58, 1.80.

Proposed **type scale** (collapse the 23 ad-hoc sizes into named roles; map sizes in use first):

| Role | Size / line | Weight | Maps from prototype |
|---|---|---|---|
| `display` | 42 / 1.0 | 700 | Logo wordmark `s42 h100` |
| `title-xl` | 36 / 1.2 | 700 | Landing headline `s36` |
| `title` | 32 / 1.2 | 700 | Screen titles `s32` |
| `title-sm` | 30 / 1.2 | 700 | Permission titles `s30 h120` |
| `body-lg` | 16 / 1.5 | 400 | Body `s16 h150` |
| `body` | 14 / 1.5 | 400 | `s14 h150` |
| `caption` | 13 / 1.5 | 400 | Helper text `s13 h150` |
| `label` | 16 / — | 500 | Button label `interMedium s16` |
| `label-sm` | 12–14 / — | 500–600 | Chips, small labels |

Use `fontVariant`/`allowFontScaling` defaults (respect user text size); cap extreme scales (`maxFontSizeMultiplier` ≈ 1.3) on display text to avoid layout breakage.

### 2.4 Spacing, radii, elevation (observed)

| Token | Values seen |
|---|---|
| Spacing scale | 4, 8, 12, 16, 20, 24, 32, 40 (screen horizontal padding **20**, landing **16**) |
| Radii | 12 (landing buttons, text-field border), 14 (permission buttons, text-field outer container), 44 (pill icon button) — **consolidate to one button radius in the design pass** |
| Heights | buttons 50 (landing) / 52 (permission screens), text field content-height (padding 16 h), icon button 36 (small) / 56 (large) |
| Shadows | Primary button: `0 2 0` at `#0A000000`; icon button: `0 4 4` at `#3F000000`; **text field: hard `0 4 0 #000000`** (neo-brutalist offset — a signature of the look, keep) |
| Opacity | Disabled / inactive: **0.5** |

Proposed spacing scale: `1=4, 2=8, 3=12, 4=16, 5=20, 6=24, 8=32, 10=40`.

## 3. Accessibility findings in the prototype (fix in the port)

Contrast ratios computed with the WCAG relative-luminance formula:

| Foreground on background | Ratio | AA normal (4.5) | AA large (3.0) |
|---|---|---|---|
| White `#FFFFFF` on brand `#FF4000` | **3.51** | ❌ | ✅ |
| Black `#000000` on brand `#FF4000` | **5.99** | ✅ | ✅ |
| Brand `#FF4000` on white | 3.51 | ❌ | ✅ |
| Brand `#FF4000` on `#121212` | 5.34 | ✅ | ✅ |
| `#B5B5B5` on `#121212` | 9.14 | ✅ | ✅ |
| `#8E8E93` on `#121212` | 5.75 | ✅ | ✅ |
| `#8E8E93` on `#1C1C1E` | 5.22 | ✅ | ✅ |

**Problem:** the sign-up/sign-in/permission screens set 13–16 px white body text on the brand orange (3.51:1) — below AA for normal text. **Options for the design pass:**
1. Keep the orange full-bleed look but use **black** body text on orange (5.99:1) and white only for large headlines;
2. Use a slightly deeper brand shade for backgrounds that reaches 4.5:1 with white (needs a designer decision — it changes the brand color);
3. Move body copy onto a dark/white surface and keep orange for accents/CTA.

Default for the port: **replicate the look for screenshot parity, flag option 1/3 as a tracked design decision** (don't silently change brand visuals).

Other items: tap targets (36 pt icon button is below the 44 pt guideline → hit-slop to 44), no focus/labels on icon-only buttons (add `accessibilityLabel`), no error color/`aria-live`-equivalent for form errors (use `accessibilityLiveRegion`/announce), video background should respect reduce-motion.

## 4. Component library (`shared/ui`)

Build the minimum that screens need; each component has a documented prop API and an accessibility contract.

| Component | Replaces (Flutter) | Key props / states |
|---|---|---|
| `Button` (variants: `primary` white-fill, `ghost` transparent + 1 px white border) | `PrimaryButton` | `label`, `onPress`, `loading`, `disabled`, `leadingIcon`, `trailingIcon`, `size` (`md` 50/radius 12/15 px, `lg` 52/radius 14/16 px); 0.5 opacity disabled |
| `IconButton` | `CustomIconButton` | `icon`, `size` (36/56), `active`; pill radius; ensure 44 pt hit area |
| `TextField` | `PrimaryTextField` | `placeholder`, `error`, `keyboardType`, `secure` (eye toggle), `autoFocus`, `returnKeyType`; hard-shadow style; add visible focus + error states (D4) |
| `Spinner` / `LoadingDots` | `CustomCircularProgressIndicator`, `BouncingDotIndicator` | Reanimated loop |
| `LoaderOverlay` | `CustomGlobalOverlayLoader` | Root-level blocking overlay with accessible label |
| `Screen` | `Scaffold` + `SafeArea` | safe-area, keyboard avoiding, background token |
| `Text` | `TextStyles` + extensions | `variant` prop from the type scale; `color` role prop |
| `Dialog` / `Sheet` | `CupertinoAlertDialog` | Confirm email dialog → native alert or bottom sheet |
| *Later:* `Avatar`, `PhotoCarousel`, `Chip`, `Toast`, `SwipeCard` | — | Added with their features |

## 5. Tooling

- **`src/core/theme/tokens.ts`** — typed constants (`colors`, `fontFamily`, `fontSize`, `lineHeight`, `space`, `radius`, `shadow`).
- **`tailwind.config.js`** — imports tokens to generate classes (`bg-brand`, `text-on-brand`, `text-title`, `p-5`, `rounded-button`); NativeWind v4 for RN.
- **Storybook (on-device) or a dev "gallery" route** to view every component state — optional, added when the component count justifies it.
- **Lint:** a rule/regex check that fails on hex colors and raw `fontSize` in `src/features/**` and `app/**`.

## 6. Open design decisions

| # | Decision | Needed by |
|---|---|---|
| D1 | White-on-orange body text: option 1, 2 or 3 above | Port of auth screens (M3) |
| D2 | Light/dark theme in v1? (default: no) | M3 |
| D3 | Error / success / warning colors | M3 |
| D4 | Text-field focus/error states: prototype has **no** visible focus change and black error text — define them | M3 |
| D5 | Brand assets: final logo files, app icon (current icon is a launcher PNG set) | Before store build |

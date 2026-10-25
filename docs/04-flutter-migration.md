# 04 — Flutter → React Native Migration

Status: Draft v0.1 · Source: `../flinger-flutter` (4 commits, ~2,650 Dart lines, ~800 lines of screens, **no backend connection**)

The prototype's value is the **visual design, copy and flows**, not the code. We rebuild it in React Native with **screenshot parity first**, then improve UX deliberately (§6) — not accidentally.

## 1. Strategy

1. **Capture references first.** Run the Flutter app and save a screenshot per screen/state into `docs/reference/flutter/` (iPhone small + large sizes). They are the acceptance test for parity.
2. **Move assets and tokens verbatim**, then build components, then screens.
3. **Port screen by screen** in the order below; each PR includes a before/after screenshot.
4. **Do not port the Flutter behavior bugs** (§5). Port intent, not accidents.
5. **Archive `flinger-flutter`** once all screens are accepted. Do not delete.

How to capture references:
```bash
cd ../flinger-flutter && flutter run            # simulator
xcrun simctl io booted screenshot docs/reference/flutter/<screen>.png
```

## 2. Screen inventory

| # | Screen | Flutter source | Route (RN) | State today | Port notes |
|---|---|---|---|---|---|
| 1 | Splash | `features/splash/.../splash_page.dart` | native splash + `app/index` | Heartbeat logo animation (scale 1 → 0.9 → 1.05 → 1 over 1.2 s loop), white bg, then **fixed 3 s delay** → auth | Keep the heartbeat on a short in-app splash only if needed; otherwise native splash until `booting` resolves. Remove the fixed delay. |
| 2 | Auth landing | `auth_landing_page.dart` (201 lines) | `(auth)/index` | Poster image → fades to looping muted video (`onboarding_bg.mp4`), 10 % black overlay; logo + "Flinger" (orange, 42), tagline "Flings, Love & Stories", headline "Meet people who feel real" (orange, 36), buttons **Create an account** (white fill, black text 15, radius 12, h 50) and **I have an account** (transparent, 1 px white border, white text 15, radius 12, h 50), legal line "By signing up, you agree to our Terms … Privacy Policy" (white 12, underlined links) — **link taps only `debugPrint`, no destination exists** | `expo-video` over `expo-image` poster; pause on reduce-motion/background; Terms/Privacy need real URLs (open in in-app browser) before store review |
| 3 | Sign-up (email) | `auth_sign_up_page.dart` + `AuthSignUpBloc` | `(auth)/sign-in` (merged flow) | Email field, validation, confirm dialog ("We need to verify your email"), then **fake 5 s delay and always errors** | Becomes phone/OTP entry per backend ADR-0006 (pending A2). Dialog pattern kept as a confirm step. |
| 4 | Sign-in | `auth_sign_in_page.dart` | merged with #3 | **UI only**: email + password fields; submit has no handler, forever at 50 % opacity | Replaced by the unified OTP flow; if email+password is chosen instead, implement fully |
| 5 | Location permission | `location_permission_page.dart` | `(onboarding)/location` | Title/body (localized), image `location_unknown.png`, button → **navigates without requesting permission** | Real `expo-location` request; handle denied/limited; **move to the moment of need** (§6) |
| 6 | Notification permission | `notification_permission_page.dart` | `(onboarding)/notifications` | Image `bell.png`, button does nothing; "Maybe later" has no handler | Real `expo-notifications` request; "Maybe later" persists dismissal |
| 7 | Profile completion | `profile_completion_page.dart` | `(onboarding)/*` | **Empty file (0 bytes)** | Net-new design + build (photos, basics, preferences) — roadmap M4 |

## 3. Shared widgets → components

| Flutter widget | File | RN component | Spec to preserve |
|---|---|---|---|
| `PrimaryButton` | `shared/buttons/primary_button.dart` | `Button` | White fill by default (`backgroundColor` overridable; `ghost` = transparent + 1 px white border), shadow `0 2 0 #0A000000`, optional leading/trailing SVG, loading spinner replaces content, `opacity` prop. **Two size presets in use:** permission screens radius 14 / h 52 / label Inter Medium 16 black; landing radius 12 / h 50 / label Inter Medium 15 |
| `CustomIconButton` | `shared/buttons/icon_button.dart` | `IconButton` | White circle/pill (radius 44), shadow `0 4 4 #3F000000`, sizes 36 & 56, inactive = 0.5 opacity + no tap |
| `PrimaryTextField` | `shared/textfields/primary_textfield.dart` | `TextField` | White fill; outer radius 14 with a **hard black offset shadow `0 4 0 #000000`**; 1 px black border radius 12 (same in enabled/focused/error — no focus color change); horizontal padding 16; text Inter Medium 16 black, cursor black; hint Inter Regular 16 `#8E8E93`; error text Inter Regular 12 **black**; password fields get an eye/eye-off toggle (black icon) |
| `BouncingDotIndicator` | `shared/progress_indicators/bouncing_dot_indicator.dart` | `LoadingDots` | Reanimated loop |
| `CustomCircularProgressIndicator` | `.../circular_progress_indicator.dart` | `Spinner` | |
| `CustomGlobalOverlayLoader` | `shared/overlay/global_overlay_loader.dart` | `LoaderOverlay` | Blocks input; accessible label |
| Email validator | `shared/validation/email_validation.dart` | zod schema (`z.string().email()`) | — |

## 4. Assets, fonts, strings, config

### Assets (copy as-is into `assets/`)
`images/` — `AppLogo_transparent.png`, `onboarding_poster.jpeg`, `location_unknown.png`, `bell.png` · `videos/onboarding_bg.mp4` · `icons/` — `app-icon.png`, `foreground.png`, `background.png` (adaptive icon), `transparent_logo.svg` · `fonts/Inter-*.ttf`.

⚠️ **Font path case mismatch in the prototype:** `pubspec.yaml` references `assets/fonts/inter/…` but the directory is `assets/fonts/Inter/`. It only works because macOS is case-insensitive and would **fail on Linux CI**. In the RN repo use one canonical **lowercase** path (`assets/fonts/inter/`) and load with `expo-font`.

SVG: render with `react-native-svg` (+ transformer) or convert the logo to an optimized component.

Video size: check `onboarding_bg.mp4` size/bitrate; re-encode (H.264, ≤ 1080p portrait, muted, ≤ ~3 MB target) to protect launch time and bundle size.

### Strings (i18n)
- Existing ARB files: `lib/l10n/main_arb/app_{en,hi}.arb` and `sub_arb/permission/permission_{en,hi}.arb`. Keys: `locationPermissionTitle/Body`, `enableLocationButton`, `notificationsPermissionTitle/Body`, `enableNotificationsButton`, `permissionMaybeLater`. **Hindi is incomplete** (`permissionMaybeLater` missing per `missing_translations.txt`).
- Many strings are hard-coded via a `.hardcoded` extension (landing headline, sign-up copy, dialogs). **All of them move into i18n JSON** (`locales/en.json`, `hi.json`) with namespaced keys (`auth.landing.headline`…).
- Convert ARB → JSON with a small one-off script (`scripts/arb-to-i18n.ts`); keep the ARB `description`s as comments in a translators' sheet.
- Library: `i18next` + `react-i18next` + `expo-localization`.

### Config & identifiers
- Prototype ids are placeholders (`com.example.flinger_flutter` / `com.example.flingerFlutter`). **Pick permanent real ids** before any store build (see [architecture §7](01-architecture.md)).
- Firebase project exists (`flinger-5dc41` per `firebase_options.dart`); no `google-services.json` / `GoogleService-Info.plist` are committed. Register new apps with final ids and supply the files via EAS secrets.
- Prototype dependencies to **drop**: `clarity_flutter` (analytics decision pending), `permission_handler` (→ Expo modules), `get_it` (→ module scope/DI not needed), `go_router` (→ Expo Router), `flutter_bloc` (→ Query + Zustand).

## 5. Prototype bugs / debt — intentionally NOT ported

| # | Issue in prototype | Resolution |
|---|---|---|
| 1 | Sign-up confirm always throws after a 5 s fake delay; real API call commented out | Real API via generated client |
| 2 | Sign-in button inert, permanently dimmed | Fully implemented flow |
| 3 | Splash waits a fixed 3 s | Resolve on auth boot; target < 1 s perceived |
| 4 | Permission screens don't request permissions | Real OS requests |
| 5 | `AuthInterceptor` injects `Bearer fake_token`; base URL `https://api.example.com` | Real session manager + config |
| 6 | `goNamed` used where a back-stack is expected (breaks back behavior) | Expo Router stack semantics |
| 7 | Default counter widget test (would fail) | Real tests ([testing](07-testing-and-quality.md)) |
| 8 | README describes Riverpod and a placeholder repo URL; app title "Flutter Demo" | Accurate docs, real app name |
| 9 | Font path case mismatch (above) | Lowercase canonical path |
| 10 | Notification/messaging init commented out in bootstrap | Implemented in the notifications feature |

## 6. UX improvements planned during the port

Tracked as explicit decisions — implement behind the screenshot-parity milestone, not mixed into it.

| # | Change | Why |
|---|---|---|
| U1 | Passwordless sign-in: phone OTP (or email OTP) instead of email → OTP → set password | Fewer steps to value, fewer drop-offs, no password reset flows (backend ADR-0006) |
| U2 | Ask for **location** when discovery first needs it and **notifications** after the first match/message, each with a short primer screen first | Higher grant rates; permission requests with context |
| U3 | No artificial splash delay; native splash held until auth state resolves | Faster perceived start |
| U4 | Real error/empty/offline states on every screen | Prototype only had one generic error |
| U5 | Accessible contrast for body text on brand color | See [design system §3](03-design-system.md) |
| U6 | 44 pt minimum hit targets; labels on icon buttons | Accessibility |
| U7 | Progress indicator through onboarding; resume where the user left off | Onboarding completion |
| U8 | Respect reduce-motion for video/animations | Accessibility, battery |

## 7. Parity checklist (per screen — copy into the PR)

- [ ] Reference screenshot(s) from Flutter attached, RN screenshot side by side (small + large phone)
- [ ] Colors, font weights/sizes, line heights match tokens
- [ ] Spacing/padding and safe-area behavior match
- [ ] Animations match timing/curve (splash heartbeat 1.2 s: 0.9 @30 %, 1.05 @60 %, 1.0 @100 %)
- [ ] All strings come from i18n (no hard-coded text); Hindi key exists or is tracked
- [ ] Accessibility labels/roles; dynamic type at 130 % doesn't break layout
- [ ] States: loading, error, empty (where applicable)
- [ ] iOS + Android checked (status bar, keyboard, back behavior)

## 8. Sequence

1. Scaffold + tokens + fonts + assets + i18n (M1)
2. `shared/ui` components with a gallery route (M2)
3. Screens in order: splash → landing → sign-in/sign-up → permissions (M3)
4. Wire to real auth once backend P2 is on staging (M3 exit)
5. Profile completion is **net-new** (M4), not a port

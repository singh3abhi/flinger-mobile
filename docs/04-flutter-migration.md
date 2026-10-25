# 04 — Flutter → React Native Migration

Status: Draft v0.2 · Source of truth: **`flinger-flutter`, remote branch `abhinav`** (18 commits, last 2026-04-09). ⚠️ The local `main` / `origin/main` / `origin/prod` are stale (Jan 2026, 4 commits, ~2.6k lines); an earlier version of this doc was written against them and **under-counted the prototype by ~3×**. Use `origin/abhinav`.

**Size of the prototype (`abhinav`):** 100 Dart files, ~9,000 lines — auth 1.5k, profile completion 2.7k, people/swipe 0.9k, shared widgets 1.4k, core 1.1k, home 0.2k, profile 0.1k, plus a local fork of the `swipe_cards` package. It is **UI + local state only**: no real API calls, discovery data comes from a mock repository.

The value is the **visual design, copy, question set and flows**, not the code. We rebuild it in React Native with **screenshot parity first**, then improve UX deliberately (§6), not accidentally.

## 1. Strategy

1. **Capture references first.** Run the Flutter app from `origin/abhinav` and save a screenshot per screen/state into `docs/reference/flutter/` (small + large iPhone). They are the acceptance test for parity.
2. **Move assets, tokens and option lists verbatim**, then components, then screens.
3. **Port screen by screen**; each PR includes before/after screenshots and the parity checklist (§7).
4. **Do not port the prototype's bugs/placeholders** (§5): port intent, not accidents.
5. **Archive `flinger-flutter`** once all screens are accepted. Before then, **push or merge `abhinav` somewhere durable** (it currently exists only as a feature branch).

How to capture references:
```bash
cd ../flinger-flutter && git checkout abhinav && flutter run     # simulator
xcrun simctl io booted screenshot docs/reference/flutter/<screen>.png
```

## 2. Screen inventory (branch `abhinav`)

### 2.1 Onboarding & auth

| # | Screen | Source | RN route | Prototype state | Port notes |
|---|---|---|---|---|---|
| 1 | Splash | `features/splash` | native splash + boot logic | Heartbeat logo animation (1.2 s loop, scale 1 → 0.9 → 1.05 → 1), then **fixed 3 s delay** | Hold native splash until auth state resolves; no fixed timer |
| 2 | Auth landing | `auth_landing_page.dart` | `(auth)/index` | Poster → fading looping video (`onboarding_bg.mp4`); "Flinger / Flings, Love & Stories / Meet people who feel real"; **Create an account** (white) and **I have an account** (outlined); Terms/Privacy links only `debugPrint` | `expo-video` + `expo-image`; real Terms/Privacy URLs |
| 3 | Sign-up (email) | `auth_sign_up_page.dart` + `AuthSignUpBloc` | `(auth)/identify` | Email field, validation, "We need to verify your email" confirm dialog; API call **commented out**, 5 s fake delay then continues | Becomes **phone-or-email** entry (decision: both). Keep the confirm-dialog pattern |
| 4 | Verify OTP | `auth_verify_otp_page.dart` + `AuthVerifyOtpBloc` | `(auth)/verify` | 6-digit `Pinput`, masked email, **Resend OTP with countdown**; verify/resend are `TODO: Call … API` with 1 s fake delays | Port UI and the resend-timer behavior; wire to real API |
| 5 | Create password | `auth_sign_up_password_page.dart` + `password_rules_widget` | **dropped if passwordless (D4)** | Password + confirm, live rules checklist (lower/upper/number/special/length **4–12**), mismatch check | Length rule is far too weak (backend wants ≥ 8 if passwords are kept). Likely removed — see D4 |
| 6 | Sign-in | `auth_sign_in_page.dart` | merged with #3/#4 | Email + password fields; submit `onTap: () {}`, **inert** | Replaced by the unified OTP flow |
| 7 | Location permission | `location_permission_page.dart` | moment-of-need primer | Title/body; button **only navigates**, never requests permission | Real `expo-location` request, in context |
| 8 | Notification permission | `notification_permission_page.dart` | after first match | Button does nothing | Real `expo-notifications` request |

### 2.2 Profile completion — 11-step questionnaire (`features/profile_completion`, 2.7k lines)

One `ProfileCompletionBloc` + a `PageView` of 11 "tab" widgets with a progress bar ("Step N of 11"), brand-orange background. Option lists live in `core/constants/profile_mappings.dart` (stable snake_case ids → move verbatim into a shared `profile-options` module; the backend mirrors them).

| Step | Tab | Data | Rules in prototype |
|---|---|---|---|
| 1 | `get_to_know_you` | first name, birthday (picker) | Letters-only formatter; **18+ check**, under-age popup, age-confirmation popup |
| 2 | `pick_gender` | gender | Woman / Man / Non-binary; "Learn how gender works on Flinger" (link is a `debugPrint` stub) |
| 3 | `choose_date_or_bff` | dating mode | `dating` or `bff` (decision D3: hide BFF in v1) |
| 4 | `who_would_you_like_to_meet` | interested in | Men / Women / Non-binary people, multi, "everyone" toggle |
| 5 | `what_are_you_hoping_to_find` | intentions | Max **2** of 6 |
| 6 | `tell_your_height` | height (cm) | Wheel picker; **default 204** (should be ~170) |
| 7 | `what_you_value_in_a_person` | values | Max **3** of 15 |
| 8 | `do_have_kids_or_family_plan` | kids, family plans | **Skippable** |
| 9 | `whats_important_in_your_life` | religion, politics | **Skippable** |
| 10 | `how_about_causes_and_communities` | causes | Max **3** of 15, **Skippable** |
| 11 | `upload_photos` | photos | 6 slots, gallery picker + cropper; **continues with ≥ 2 photos** (must be **≥ 4**) |

Submit (`SubmitProfilePressed`) is a 1 s fake delay — nothing is sent. Progress is **not persisted** (killed app restarts at step 1) — fix per FR-ONB-16.

### 2.3 Home & discovery shell (`features/home`, `people`, `discover`, `liked_you`, `chats`, `profile`)

| Screen | Source | State |
|---|---|---|
| Home shell | `home_page`, `home_bottom_nav` | 5 tabs: **Profile · Discover · People · Liked You · Chat** (`HomeTab` enum), white bottom bar, orange active state |
| People (swipe deck) | `people_page`, `PeopleBloc`, `user_profile_card`, `people_action_buttons`, `packages/swipe_cards` | Real swipe UI with like / pass / superlike, paging (`offset`/`limit`), full profile card (photos, verified badge, About, Looking for, Values, Family, Lifestyle, Causes); data from **`ProfileRepositoryImpl` mock** (14 fake names, `pravatar.cc` images) |
| Discover | `discover_page` | Placeholder empty state ("New people in 21 hours", "Nothing new right now") |
| Liked You | `liked_you_page` + spotlight widget | Placeholder |
| Chats | `chats_page` + spotlight widget | Placeholder ("Your matches" strip) |
| Profile | `profile_page` | **20-line stub** (title only) |
| Error | `error_page` | Generic |

Net: **onboarding UX is largely complete; discovery UI is half-built; profile, chat, liked-you, discover are stubs**.

## 3. Shared widgets → components

| Flutter widget | RN component | Spec to preserve |
|---|---|---|
| `PrimaryButton` | `Button` | White fill default, `ghost` = transparent + 1 px white border, shadow `0 2 0 #0A000000`, loading spinner replaces content. Presets: landing radius 12 / h 50 / label 15; permission radius 14 / h 52 / label 16 |
| `CustomIconButton` | `IconButton` | White pill (radius 44), shadow `0 4 4 #3F000000`, 36/56, inactive 0.5 opacity |
| `PrimaryTextField` | `TextField` | White fill; outer radius 14 + **hard black `0 4 0` shadow**; 1 px black border radius 12; text Inter Medium 16 black; hint Inter Regular 16 `#8E8E93`; eye toggle for passwords |
| `toggle_switch_button` | `Switch` wrapper | Used in selection tiles; verify against reference |
| `primary_small_chip` | `Chip` | Multi-select chips (values, causes, intentions) |
| `primary_appbar` | `AppBar` | Home stack header |
| `show_cupertino_dialog` | `ConfirmDialog` | Native alert on iOS; title/message/primary/secondary actions |
| `dob_picker_mixin` / `birth_picker` | `DatePicker` | Birthday wheel; 18+ validation lives in a pure function |
| `upload_photo_tile` + `image_picker_service` + `image_cropper_service` | `PhotoSlot` + `expo-image-picker` + `expo-image-manipulator` (cropping UI via a cropper lib or custom) | 6 slots, add/remove, crop |
| `BouncingDotIndicator`, `CircularProgress`, `GlobalOverlayLoader` | `LoadingDots`, `Spinner`, `LoaderOverlay` | Blocking overlay with accessible label |
| `Pinput` (OTP) | `OtpInput` | 6 cells, paste/autofill (`textContentType="oneTimeCode"`), resend countdown |
| Email validator, password validator | zod schemas / pure functions | Password rules dropped if passwordless |
| `swipe_cards` package (local fork) | Reanimated + Gesture Handler `SwipeDeck` | Like/pass/superlike gestures, card stack, paging; **no off-the-shelf port — rebuild** (M5) |

## 4. Assets, fonts, strings, config

### Assets (copy as-is into `assets/`)
`images/` (5), `videos/onboarding_bg.mp4`, `icons/` (5, incl. adaptive-icon layers and `transparent_logo.svg`), `fonts/Inter-*` (6 weights).

⚠️ **Font path case mismatch:** `pubspec.yaml` references `assets/fonts/inter/…` but the folder is `assets/fonts/Inter/`. Works on macOS (case-insensitive), **fails on Linux CI**. Use one lowercase path in RN (`expo-font`).

Re-encode `onboarding_bg.mp4` (H.264, ≤ 1080p portrait, muted, small) to protect launch time and app size.

### Strings (i18n) — English only at launch
- ARB files exist for `en` and `hi`, but **Hindi is parked** (decision: English-only at launch; keep the i18n structure so localization can follow). `missing_translations.txt` shows Hindi is already incomplete.
- A large share of strings are **hard-coded** via a `.hardcoded` extension (all of the questionnaire, landing, OTP, dialogs). **All move into i18n JSON** (`en.json`, namespaced keys) from day one.
- Option labels (religion, causes, values…) are **ids in code + labels in i18n**, so adding Hindi later doesn't touch logic.
- `i18next` + `react-i18next` + `expo-localization`.

### Config & identifiers
- **Placeholder ids:** Android `com.example.flinger_flutter`; iOS `com.example.flingerFlutter`. Choose permanent ids before any store build ([ADR-0006](adr/0006-bundle-identifiers.md)).
- Firebase project `flinger-5dc41` exists; no `google-services.json` / `GoogleService-Info.plist` committed. Register new apps with the final ids; supply files via EAS secrets.
- Prototype deps to **drop/replace:** `flutter_bloc`+`equatable` (→ Query + Zustand), `go_router` (→ Expo Router), `get_it`, `permission_handler` (→ Expo modules), `clarity_flutter` (analytics decision pending), `shared_preferences` (→ MMKV/secure-store), `video_player` (→ `expo-video`), `cached_network_image` (→ `expo-image`), `loader_overlay`, `pretty_dio_logger`.

## 5. Prototype bugs / placeholders — NOT ported

Verified on `abhinav`:

| # | Issue | Resolution |
|---|---|---|
| 1 | No real API anywhere: `baseUrl = https://api.example.com`, `AuthInterceptor` injects `Bearer fake_token`; sign-up, OTP verify/resend, profile submit and discovery are fake delays/mocks | Real session manager + generated API client |
| 2 | Sign-in screen inert (`onTap: () {}`) | Unified OTP flow |
| 3 | Splash waits a fixed 3 s | Resolve on auth boot |
| 4 | Permission screens don't request permissions | Real OS requests, in context |
| 5 | Password rule allows 4–12 chars, composition rules incl. a max length of 12 | Passwordless (D4); if kept, ≥ 8 and no tiny max |
| 6 | Photos: continue allowed with 2 | **Min 4, max 6** enforced client + server |
| 7 | Height default 204 cm | Sensible default (~170) or no default |
| 8 | Onboarding progress not persisted; killed app restarts at step 1 | Persisted draft + resume |
| 9 | Gender ids `woman/man` vs interested-in ids `women/men` | One normalized id set |
| 10 | "Learn how gender works" / "Learn why this matters" / Terms / Privacy links are `debugPrint` stubs | Real content/URLs |
| 11 | `goNamed` used where a back stack is expected | Expo Router stack semantics |
| 12 | Default counter widget test (would fail); CI workflow fully commented out | Real tests, real CI |
| 13 | README describes Riverpod and a placeholder repo; app title "Flutter Demo" | Accurate docs, real app name |
| 14 | Font path case mismatch | Lowercase canonical path |
| 15 | Notification/messaging init commented out in bootstrap | Implemented in notifications feature |
| 16 | Mixed dark text colors on brand background with low contrast (white on `#FF4000` = 3.51:1) | See [design system §3](03-design-system.md) |

## 6. UX improvements planned during the port

Implement **after** screenshot parity, as tracked decisions:

| # | Change | Why |
|---|---|---|
| U1 | Passwordless OTP on phone **or** email (no password step) — decision D4 | Fewer steps, no weak-password risk |
| U2 | Ask for **location** when discovery first needs it and **notifications** after the first match, each with a primer | Better grant rates |
| U3 | No artificial splash delay | Faster perceived start |
| U4 | Loading / error / empty / offline states on every screen | Prototype has one generic error |
| U5 | Accessible contrast: orange is now an accent only (Theme v0.2, cream and ember) | WCAG AA; resolved |
| U6 | 44 pt hit targets; accessibility labels on icon-only buttons | Accessibility |
| U7 | Persist onboarding progress; allow going back with data kept | Completion rate |
| U8 | Reduce-motion for video/animation | Accessibility, battery |
| U9 | Hinge-style likes on a **photo or prompt (+ optional comment)** and **3 prompts** in onboarding — decisions D1/D2 ([Hinge baseline](https://github.com/singh3abhi/flinger-backend/blob/main/docs/12-hinge-baseline.md)) | Higher-quality likes; Hinge parity |

## 7. Parity checklist (per screen — copy into the PR)

- [ ] Reference screenshot(s) from Flutter attached, RN side by side (small + large phone)
- [ ] Colors, weights, sizes, line heights match tokens
- [ ] Spacing and safe-area behavior match
- [ ] Animation timings match (splash heartbeat 1.2 s: 0.9 @30 %, 1.05 @60 %, 1.0 @100 %; page transitions 300 ms ease-out)
- [ ] All strings via i18n; no hard-coded text
- [ ] Option ids match `profile_mappings.dart` exactly
- [ ] Selection limits enforced (intentions ≤ 2, values ≤ 3, causes ≤ 3, photos 4–6)
- [ ] Accessibility labels/roles; usable at 130 % font scale
- [ ] States: loading, error, empty, offline where applicable
- [ ] iOS + Android checked (status bar, keyboard, back behavior)

## 8. Sequence (updated)

1. **M1** scaffold: tokens, fonts, assets, i18n, option lists as a shared module
2. **M2** components, including `OtpInput`, `Chip`, `PhotoSlot`, `DatePicker`, dialogs
3. **M3** auth screens (landing → identify → OTP) wired to real auth; permissions primers
4. **M4** **port the 11-step questionnaire** (now a port, not net-new) + photo upload with moderation states + persisted progress + profile edit
5. **M5** swipe deck (rebuild `swipe_cards`), profile card, Liked You, real Discover
6. **M6** chat; **M7** safety/settings; **M8** hardening

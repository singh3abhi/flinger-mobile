# Design prototype (v0.1)

42 artboards (390 x 844 phones plus a design-system board) covering the whole v1 flow: sign-in, 13-step onboarding, Discover, likes with comments, matches, chat, safety, profile, settings, system states.

- **Live canvas (private):** https://claude.ai/artifact/5emL9THcQDuiPRz6DP6D5z
- **Source:** `prototype/*.dc.html` + `prototype/canvas.json` (canvas layout and review notes). These files are the Design canvas format; images were uploaded to the canvas as assets, so the copies here reference `/_blob/...` ids and will not render stand-alone.
- **Original brand assets** used by the designs are in `assets/` (logo, landing poster, location and bell illustrations), copied from `flinger-flutter` (`abhinav` branch).

## Decisions baked into the designs
- Four tabs: Discover, Liked You, Chats, Profile (Flutter had five; Discover and People merged).
- Hinge-style likes on a photo or prompt with an optional comment; pass button; 25 likes a day.
- 13-step onboarding: your questionnaire plus prompts, 4 to 6 photos, location primer, review and agree. BFF mode is not shown.
- Passwordless OTP. Phase 0: email. Phase 1: phone (artboard 03b), after SMS is set up.
- **Theme: Cream and ember (option B), chosen 2026-10-25.** Cream/warm-white screens; orange `#E4572E` only as an accent (buttons, hearts, badges, progress). All text passes 4.5:1. See `docs/03-design-system.md` §1.5. Artboard 00 keeps the four options for reference.
- Read receipts off by default.

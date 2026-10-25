# ADR-0006 — Permanent app / bundle identifiers

**Status:** Open · decision needed before the first store/TestFlight build

## Context
The Flutter prototype uses placeholders (`com.example.flinger_flutter` on Android, `com.example.flingerFlutter` on iOS). Store identifiers **cannot be changed** after publishing, and Firebase/APNs registrations depend on them.

## Decision needed
Pick one reverse-DNS id used for **both** platforms (e.g. `<owned-domain-reversed>.flinger`), plus separate suffixes for non-production variants (e.g. `.staging`, `.dev`) so builds can coexist on a device.

Inputs needed from the owner: the domain/brand to reverse (assumption: a Flinger domain will be registered in backend P0).

## Consequences once decided
Register new iOS/Android apps in the existing Firebase project (`flinger-5dc41`) or a new one; create APNs key; set ids in `app.config.ts` per EAS profile.

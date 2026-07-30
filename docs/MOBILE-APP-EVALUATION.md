# Mobile app evaluation: React Native / Flutter vs. PWA

Written deliverable for the "PWA & Mobile App Groundwork" position: should the
Thilo become a native mobile app (React Native or Flutter), or is a
Progressive Web App the better vehicle for mobile and offline use?

**Conclusion: PWA-first.** The evaluation hours plus the groundwork budget
went into shipping the full PWA (precached site, offline content and images,
install icons, update prompt) instead of a native prototype. Rationale below.

## Requirements

The Thilo is a content reference for scouts, not an interactive tool:

1. **Offline in the field** - camps and hikes often have no connectivity; the
   whole book must work offline after one visit.
2. **Three locales** (de/fr/it) with cross-language navigation.
3. **Content lives in Strapi** - editors publish there; the site rebuilds and
   readers should get updates without any manual action.
4. **Long-term maintainability on a small budget** - the mandate is
   maintained in small yearly tranches by few people; every extra toolchain
   is a liability.
5. **Free, frictionless distribution** - no accounts, no purchase, ideally no
   app store between a scout and the content.

## Options

### React Native (with Expo)

- Reuses JavaScript knowledge, but *not* this codebase: the rewrite
  deliberately reduced React to a single quiz island; all rendering is
  Astro-generated static HTML. A React Native app would be a second frontend
  that re-implements markdown rendering, navigation, search, and offline
  caching against the Strapi API.
- Requires Apple (USD 99/year) and Google Play (USD 25 once) developer
  accounts under a PBS-controlled organisation, plus store review on every
  release and periodic forced SDK upgrades (Expo/React Native deprecate
  aggressively; a yearly-tranche project will routinely miss those windows).
- Content updates would either need app releases or an in-app sync layer,
  which is exactly what the service worker already does for free.

### Flutter

- Same store, account, and release overhead as React Native.
- Dart shares nothing with the existing stack, so it adds a whole second
  language and toolchain to a project whose first goal is maintainability.
- Strong for heavily interactive UI, which the Thilo is not.

### PWA (chosen)

- One codebase, no store, no developer accounts, no review cycles.
- Workbox precaches the built site; content and images are runtime-cached, so
  the full book works offline after the first visit and updates itself when
  online (with a localized update prompt).
- Installable to the home screen on Android and iOS with proper icons and
  standalone display; iOS support for installed PWAs (including notifications
  since 16.4) now covers what the Thilo needs.
- The main PWA limitations (no store presence, limited background push, no
  deep native APIs) do not affect a reference book.

## Decision

| Criterion              | React Native      | Flutter           | PWA                  |
| ---------------------- | ----------------- | ----------------- | -------------------- |
| Offline book content   | extra sync layer  | extra sync layer  | service worker, done |
| Reuse of existing code | none              | none              | total                |
| Distribution           | stores + accounts | stores + accounts | URL                  |
| Content updates        | release or sync   | release or sync   | automatic            |
| Added toolchains       | 1 (+ stores)      | 2 (+ stores)      | 0                    |
| Yearly maintenance     | high              | high              | negligible           |

PWA wins on every criterion that matters for this product. If a store
presence ever becomes a requirement (e.g. discoverability or push campaigns),
the cheapest path is **Capacitor wrapping the existing static build**, not a
React Native/Flutter rewrite - the PWA work done now is a prerequisite for
that path, so nothing is lost.

# Offered
- [x] Research, Rewrite & Code Maintainability
   - [x] Recherche und Rewrite in geeignetem Framework
   - [x] Verbesserung der Code-Struktur zur langfristigen Wartbarkeit
   - [x] Vorbereitung für zukünftige Erweiterungen (z.B. PWA, AI-Integration)
- [x] Tailwind Migration
   - [x] Refactoring des Design Frameworks von Primer Design zu Tailwind für bessere Wartbarkeit und Performance
- [x] Google Indexing Review
   - [x] Überprüfung und Optimierung für Google-Indexierung und AI-Search-Integration
- [x] PWA & Mobile App Groundwork
   - [x] Vorarbeiten für Progressive Web App Integration (Service Worker Setup, Manifest)
   - [x] Evaluierung von Mobile App Optionen (z.B. React Native, Flutter) für zukünftige Entwicklung - siehe [docs/MOBILE-APP-EVALUATION.md](./docs/MOBILE-APP-EVALUATION.md)
- [x] Erste AI Quiz Tests
   - [x] Recherche und Test-Integration von generierten Q&As - siehe [docs/GAMIFICATION.md](./docs/GAMIFICATION.md#ai-quiz-tooling-evaluation-july-2026)
- [x] Bug Triage & Fixes
   - [x] Behandlung neuer Bugs und kleinerer Anpassungen

## Architecture & Code Quality

- [x] **Unify data fetching**: `fetchAllSections()` now calls `getSections()` internally, so there is a single fetch path, cache, and `BACKEND_URL` handling in `src/utils/data.ts`.

- [x] **Replace `is:inline` + init-guard pattern**: `Header.astro`, `TableOfContents.astro`, and `Search.astro` now use `AbortController`: each `setup()` aborts the previous controller and re-registers listeners on `astro:page-load`.

- [x] **Split oversized components**: Pure search utilities live in `src/utils/search.ts`, language switching in `src/utils/languageSwitcher.ts`, markdown rendering in `src/utils/markdown.ts`, URL building in `src/utils/urls.ts`. `TableOfContents.astro` keeps its sidebar logic in one script but it is now scoped, documented, and torn down cleanly.

- [x] **Complete i18n coverage**: `Zielgruppe` (`section.targetGroup`), the language label (`header.language`), and the scroll-to-top `aria-label` (`section.backToTop`) all come from `src/i18n/`; 404, imprint error, and PWA prompt strings were added for de/fr/it.

## UX & Visual

- [x] **Search dropdown excerpt**: Dropdown results show a highlighted 1-2 line excerpt (`getExcerpt` + `highlightHtml` in `src/utils/search.ts`).

- [x] **Sidebar animation on mobile**: Slide-in keyframe on `.sidebar-open` plus overlay fade, both behind `prefers-reduced-motion: no-preference`.

- [x] **location indicator** the current chapter is tracked live in the sidebar. No visible breadcrumbs because it is not necessary.

- [x] **Scroll-to-top button**: `aria-label` translated via `section.backToTop`; button floats above content with z-50.

- [x] **Print styles**: `src/styles/print.css` hides chrome and formats content for printing.

## Functionality

- [x] **Offline / PWA improvement**: Workbox `globPatterns` precaches built HTML (plus JS/CSS/fonts/icons); API responses stay StaleWhileRevalidate. Content updates are picked up via hourly and on-focus service worker update checks with a localized update prompt.

# Feedback 19.07.26
- [x] Remove breadcrumbs and skip to content button
- [x] **Home link 404s from a chapter page in a non-default locale**: on a French chapter, clicking
      "Accueil" (home) 404s instead of going to the French home page. Likely a trailing-slash
      mismatch between the home link's href and the locale's actual route
- [x] `h4` in section content renders at the browser default size (`src/styles/section.css` sets
      color but no `font-size` for it), noticeably smaller than the old site; give it an explicit size
- [x] Search
  - [x] Result links point at the section/chapter page only (`getLocalizedUrl` in `Search.astro`'s
        `#search()`), not the specific heading that matched, add a `#fragment` to the nearest parent
        `h*` so results jump straight to the match
  - [x] Full-page results (`#renderResults` in `Search.astro`): only the title is a link inside the
        card right now. Make the whole result box clickable, and also the bereich / kapitel text text in the pill below or the title to lead to the containing chapter, but clicking on the pill redirects to the actual result text. include displayed alt-captions in the results.
- [x] Images (alt-text parsing in `src/utils/markdown.ts`)
  - [x] Support float + margin via the existing alt-text style-directive syntax
  - [x] Alt text is being consumed as a carrier for caption/CSS directives rather than left as
        accessible description text, compare to the old code's handling and fix
- [x] Match the GitHub Actions deploy workflow to the old site's, then hand off to James
- [ ] hide draft chapters

## not for now
- [ ] future todos:
  - [ ] auto build 1/day
  - [ ] mobileviewer.io / pixel 7a image viewing off
  - [ ] Own the quiz frontend, replace `react-quiz-component` with a custom component,
        see [docs/GAMIFICATION.md](./docs/GAMIFICATION.md#1-ai-generated-quizzes-per-chapter)
  - [ ] LLM-backed question generation, no account / tracking
  - [ ] How to verify and classify generated questions? -> manual verification!
  - [ ] IT Richtlinie
  - [ ] Strapi updates (James), prerequisite for quiz work
  - [ ] images: click to enlarge / viewer
  - [ ] continue where you left off - intelligent bookmark

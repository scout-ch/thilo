# Improvements, July 2026 (branch `astro-rewrite-f-changes`)

## Third pass: code-review cleanup (CSS, HTML, types)

### CSS consolidation

- `colors.css` is the single source of the `--color-primary-*` ramp;
  `layout.css` previously defined the same variable names with different
  mix percentages, and the winner depended on bundle order
- `layout.css` shrank from 177 lines (62 `!important`s) to the handful of
  classes Tailwind does not provide (`.bg-primary`, skip link, sidebar
  active states); the unused `.bg/text/border-primary-*` utility blocks are
  gone
- custom `.mt-*`, `.mb-*`, `.p-*`, `.rounded` classes that silently
  overrode Tailwind's scale with different values were removed; templates
  now use the Tailwind classes with the same rendered values (`mb-3` →
  `mb-6` etc.)
- dead `nav.header-nav` accordion CSS from the pre-rewrite React header
  removed; undefined classes (`hover:bg-primary-dark`,
  `focus:ring-primary`) replaced with defined ones
- `global.css` owns all stylesheet imports; `BaseLayout` no longer
  re-imports `layout.css`/`colors.css`
- `variables.css` keeps only tokens with consumers (breakpoint/z-index
  scales and unused type/shadow/spacing steps deleted)

### Fonts

- `fonts.css`: 12 `@font-face` blocks with `.eot`/`.svg`/`.ttf` fallbacks
  reduced to 6 faces as woff2+woff; unused Black/ExtraLight/Light files
  deleted from the repo
- the SemiBold face now spans `font-weight: 500 600`, so `font-medium`
  renders an actual medium weight (it previously fell back to Regular
  because no 500 cut existed)

### HTML / accessibility

- search input is a real combobox: `aria-expanded`,
  `aria-activedescendant`, options with `role="option"`/`aria-selected`;
  full-page results announce via `aria-live="polite"`
- menu and sidebar toggles expose `aria-haspopup`/`aria-controls` and keep
  `aria-expanded` in sync
- previously hardcoded English/German labels (Toggle sidebar, Open menu,
  Navigation, Toggle chapters, Close) are localized de/fr/it
- removed the React-ism `key={...}` that leaked into the DOM as a literal
  attribute through AstroLink's prop spread

### TypeScript

- no `any` remains outside `(window as any)` globals: layouts and
  components use `SectionT`/`SectionData`/`SimpleSectionsData`, the search
  widget uses `SearchIndexEntry`/`SearchResult`, the markdown renderer uses
  marked's `Tokens`, the language switcher has typed meta shapes
- `BACKEND_URL` is declared on `ImportMetaEnv` instead of `(import.meta as
  any)` casts
- corrected the stale "Strapi v4 response format" comment (backend is v3)
  and dropped the unused `currentSection` prop from `TableOfContents`

## Second pass: payload, runtime and UX

### Static search index

The search widget used to receive all section data as JSON in `data-*`
attributes; the search page embedded the full Strapi content **three times**
(two header widgets + the page widget). Now a per-locale
`/search-index/[locale].json` is generated at build time
(`src/pages/search-index/[locale].json.ts`) with markdown stripped to plain
text (chapter entries include their target-group content, which was
previously unsearchable). The widget fetches it on first focus/typing, keeps
it in a module-level cache across view transitions, and the service worker
precaches it for offline search. Consequences:

- pages no longer carry section JSON for search at all
- header search matches *content* on every page (before, section pages only
  provided titles, so content matches silently failed outside `/search`)
- excerpts and scoring operate on plain text, so no more `**bold**` or
  `[link](...)` artifacts in results
- the header renders one search widget instead of two identical ones
- result clicks navigate via view transitions (no full reload)

### Slimmer per-page metadata

The `all-sections` meta tag now carries only what the client language
switcher reads: section ids, slugs, and chapter slug/sorting pairs, plus
slug/url mapping entries. Titles, menu names, icon URLs and colors are no
longer serialized into every page.

### Cheaper scroll handling

- sidebar chapter tracking resolves link/heading pairs once per navigation
  instead of `querySelectorAll` + `getElementById` per scroll frame, and
  exits early when the active chapter is unchanged
- back-to-top visibility only touches the DOM on state change
- scroll listeners are `passive`
- content images get `decoding="async"`
- exact hash matching when centering the ToC (`#foo` no longer matches
  `#foo-2`)

### UX fixes

- quiz loading/error/empty states localized (de/fr/it) via props from
  `Section.astro`
- the invisible back-to-top button no longer intercepts taps in the
  bottom-right corner (`pointer-events` follows visibility)

---

Full audit and improvement pass over the Astro rewrite: bug fixes (linking,
language switching, i18n), SEO, performance, PWA reliability, dark mode, and
gamification groundwork. One section per commit, in order.

## Bug fixes

### Broken `/en/` and duplicate `/de/` routes

`src/pages/index.astro`'s `getStaticPaths` (re-exported by every `[lang]`
page) generated paths for `en` and `de`. English has no content in Strapi
(0 sections), so `/en/` built empty pages, and `/de/...` duplicated the
unprefixed German pages. Locales are now `de`, `fr`, `it`, with `de`
unprefixed only. English can be re-added in `astro.config.mjs` and
`getStaticPaths` once Strapi has content.

### Slug transliteration

`slugify()` dropped umlauts entirely ("Übermitteln" → "bermitteln"). It now
transliterates German/ligature characters to their bases (`ä→ae, ö→oe, ü→ue,
ß→ss, œ→oe, æ→ae`) and strips accents from remaining characters via NFD
normalization, which covers French/Italian (`é→e, à→a, ì→i, ç→c` etc.).
No redirects from old URLs: per project decision, redeployment invalidates
old links anyway.

### Language switching resolved the wrong section

Cross-locale section mapping is keyed by the Strapi `sorting` field, and
German has two sections with `sorting=5` ("Übermitteln" and an empty "Beta
Quiz Erste Hilfe"), so switching fr→de could land on the wrong one.
`fetchAllSections()` now resolves collisions deterministically (the section
with the most chapters is canonical; duplicates only map to themselves) and
warns at build time. The client switcher (`src/utils/languageSwitcher.ts`)
was rewritten to use these mappings, which are embedded in the
`all-sections` meta tag, and to carry the chapter hash across languages by
matching chapter `sorting`.

Related: language options in the header menu now `preventDefault()` and go
through the JS switcher; their server-rendered hrefs go stale because the
header persists across view transitions.

### Base path inconsistencies

Canonical URLs included the deploy base (`/thilo/`), but sitemap, robots.txt,
and hreflang alternates did not. All absolute URLs now come from
`absoluteUrl()` in `src/utils/urls.ts` (SITE + BASE_URL + path). The sitemap
also groups localized alternates via the section mappings.

### Stale persisted sidebar

`TableOfContents` uses `transition:persist`, so its server-rendered active
link, expanded chapter list, and `aria-` attributes survived navigation
unchanged. `updateActiveNav()` now recomputes them from the URL on every
`astro:page-load`. Also added: focus management when opening/closing the
mobile sidebar, `aria-expanded` on chapter toggles.

### Imprint page ignored the locale

`impressum.astro` passed `locale=` to Strapi v3, which expects `_locale=`,
so French/Italian imprint pages showed German text. Fixed, plus the page now
uses `BACKEND_URL`, renders markdown server-side, and shows a localized
error if the fetch fails.

### 404 page localized and styled

The 404 page used CSS classes that no longer existed and was German-only.
Now Tailwind-styled and localized; since the static host serves the German
`404.html` for all paths, an inline script re-localizes text and links when
the missed URL is under `/fr/` or `/it/`.

### Search widget across view transitions

The persisted header search re-ran `connectedCallback` on every navigation,
stacking duplicate listeners, and its dropdown/full-page mode went stale.
Listeners now use an `AbortController` (aborted in `disconnectedCallback`),
and mode + query re-sync on `astro:page-load`.

This listener lifecycle also resolves the long-standing iOS Safari search
bug from the React app, where stacked and orphaned event listeners left the
search unresponsive; the widget was rebuilt from scratch with exactly one
registration path per mount.

## Performance

### Build-time markdown rendering

The client-side React `MarkdownRenderer` was replaced by
`src/utils/markdown.ts`, rendering Strapi markdown at build time with a
custom `marked` renderer:

- headings get `id={slugify(text)}` so in-page anchor links work
- internal links are base- and locale-prefixed; external links open in a new
  tab with `rel="noopener"`
- images keep the caption/CSS-from-alt conventions, get `loading="lazy"`,
  and relative sources are resolved against `BACKEND_URL`
- quiz links (containing `quiz` + `.json`) become `<QuizComponent
  client:visible>` islands, the only React left on content pages
- tables are wrapped for horizontal scrolling

### Shift-free anchor scrolling

Scrolling to an anchor (sidebar chapter links, in-content `#` links, or a
hash on initial load) waits for images *above* the target to load, so the
content doesn't shift under the reader. Lazy images above the target are
flipped to eager to avoid a deadlock, with a 3-second timeout so a stalled
image can't block the scroll. Shared helper: `window.thiloScrollToAnchor`
in `BaseLayout.astro`.

### Native-feel polish

- viewport-based prefetching (`prefetch.defaultStrategy: 'viewport'`), so
  links load before they're tapped
- the two above-the-fold font weights are preloaded
- `touch-action: manipulation` and transparent tap highlight on interactive
  elements (no 300 ms double-tap delay, no gray flash)
- mobile sidebar slides in and the overlay fades (respecting
  `prefers-reduced-motion`)

### Dead code removal

Removed unused exports from the data layer (`getLinks`, `searchContent`,
`formatDate`, `getSectionById`, `sectionIdMappings`, ...) and the deleted
React `MarkdownRenderer`/`Link` components. `fetchAllSections()` now calls
`getSections()` instead of fetching Strapi independently.

## SEO

- JSON-LD structured data: `WebSite` + `SearchAction` on home pages,
  `Article` + `BreadcrumbList` on section pages - no visible breadcrumbs, not 
  necessary
- complete OpenGraph and Twitter tags (`og:site_name`, `og:locale` with
  alternates, `og:image`, `twitter:card`)
- **Strapi overrides**: if `seo_title` / `seo_description` fields are added
  to the Section content type in Strapi, they are used automatically;
  otherwise title and description fall back to section title and extracted
  content

## PWA

- real install icons: `pwa-192.png`, `pwa-512.png` (including `maskable`),
  and `apple-touch-icon.png`, generated from the scout badge on the brand
  background
- more reliable content updates: `cleanupOutdatedCaches`, hourly and
  on-tab-focus `registration.update()` checks, and a localized update
  prompt (de/fr/it) with reload/later actions and an offline-ready toast

## Dark mode and DarkReader

Three-state theme (`sync` with the OS, `light`, `dark`) cycled from the
header menu and stored in `localStorage('thilo-theme')`:

- `html.dark` class applied before first paint (no flash), re-applied after
  every view transition and on OS theme changes
- section accent colors are preserved through `color-mix` indirection
  variables (`--mix-light`, `--mix-dark`, `--accent-keep`) so every
  section-colored surface adapts without per-color overrides
- `src/styles/dark.css` maps the Tailwind gray utilities used in templates
- `color-scheme` CSS + meta is set correctly in both themes, which is also
  what the DarkReader extension keys on to leave the site alone when it is
  already dark

## Gamification groundwork

Local-first progress tracking, no accounts needed; see
[GAMIFICATION.md](./GAMIFICATION.md) for the full roadmap (AI-generated
quizzes, badges, MiData/group sync):

- `src/utils/progress.ts`: chapters read + best quiz scores in
  `localStorage`, cross-tab change events
- chapters are marked read when their heading scrolls fully into view;
  read chapters show a partially filled bookmark in the sidebar
- quiz completions are recorded automatically from `Quiz.tsx`

# CLAUDE.md


## Commands

```bash
pnpm run dev        # start dev server (http://localhost:4321)
pnpm run build      # astro check + build to /build
pnpm run preview    # preview production build
```

There is no test suite. `pnpm run build` runs `astro check` (TypeScript + Astro type checking) before building.

Do not test intermittently. Let the programmer do all verification, you only write code.

## Architecture

This is an **Astro SSG** rewrite of the original React app (see `astro-rewrite` branch). The site builds entirely at build time by fetching content from the Strapi backend at `https://api.thilo.scouts.ch/`.

### Data layer

All content is fetched from Strapi during the build. Key utilities in `src/utils/`:

- **`data.ts`** — typed fetch wrappers (`getSections`, `getStartPage`, `getSectionBySlug`, `searchContent`). Includes an in-memory cache with 1-hour TTL used during the build.
- **`sectionMappings.ts`** — `fetchAllSections()` fetches all three locales in parallel and builds a cross-locale section mapping keyed by the `sorting` field. Used at build time by the Header and layout to know every section's URL in every language.
- **`staticPaths.ts`** — `generateSectionPaths(locales, includeLocaleParam)` drives `getStaticPaths()` in page files.
- **`slugMapping.ts`** — manual slug overrides for a handful of sections that have custom slugs (e.g. `die-pfadi`, `orientieren`). Most slugs are auto-generated via `slugify(title)`.

The `BACKEND_URL` env var defaults to `https://api.thilo.scouts.ch/` if not set.

### Routing / i18n

Astro `i18n` is configured with `defaultLocale: "de"` and `prefixDefaultLocale: false`. This means:

- German pages: `/` (home), `/[slug]`, `/search`, `/impressum`
- French/Italian: `/fr/`, `/fr/[slug]`, `/it/`, `/it/[slug]`, etc.

Each route has a German-only file at `src/pages/[slug].astro` and a localized file at `src/pages/[lang]/[slug].astro`. They both delegate to `SectionPage.astro`.

The `src/i18n/` module provides translated UI strings (de/fr/it). English content exists in Strapi but not in the i18n strings.

### Layout stack

```
BaseLayout.astro           ← <html>, global CSS, ViewTransitions, PWA prompt
  └─ MainLayoutWithToC.astro ← fetches sections, renders:
       ├─ Header.astro       (search + language/menu dropdown)
       ├─ TableOfContents.astro (sidebar)
       └─ main slot
            ├─ Section.astro
            └─ Footer.astro
```

`Header` and `TableOfContents` use `transition:persist` to survive Astro page transitions.

All section data for all locales is serialized into a `<meta name="all-sections">` tag by `BaseLayout` so that the client-side language switcher can work without an extra fetch.

### Section theming

Each section from Strapi has `color_primary` and `color_primary_light` fields. `Section.astro` sets these as CSS custom properties (`--color-primary`, etc.) on the section element. `BaseLayout` includes a `window.updateThemeColors()` helper and re-applies colors on `astro:page-load` (Astro transitions).

### Search

Search is a **Web Component** (`<search-widget>`) defined in `src/components/Search.astro`. It is server-rendered with section data embedded in `data-*` attributes, then hydrates on the client. In the header it shows a dropdown; on the `/search` page it renders full results. Sections are matched by relevance scoring across title and content fields.

### Interactive components (React)

Only a few components are React:
- `MarkdownRenderer.tsx` — renders Strapi markdown content using `marked`
- `Quiz.tsx` — wraps `react-quiz-component` for chapter quizzes
- `Link.tsx` — handles internal/external link routing with locale awareness

### PWA

`@vite-pwa/astro` with Workbox. API responses from `api.thilo.scouts.ch` are cached with StaleWhileRevalidate (7 days). The service worker is disabled in dev (`devOptions.enabled: false`). 

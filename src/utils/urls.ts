// Absolute URLs for SEO artifacts (canonical, hreflang, sitemap, robots).
// Combines the `site` config with the base path (`base` config or --base flag)
// so every environment produces consistent URLs.
export function absoluteUrl(path: string): string {
  const site = (import.meta.env.SITE ?? 'https://thilo.scouts.ch').replace(/\/$/, '');
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${site}${base}${normalizedPath}`;
}

// The site's home page URL for a given locale (without the base path prefix
// - AstroLink/callers add that separately). astro.config.mjs sets
// `build.format: 'file'`, so every route emits `<route>.html` rather than
// `<route>/index.html` - a trailing slash on a non-default locale's home
// link (`/fr/`) points at a file that doesn't exist and 404s. `de` is the
// default locale (`prefixDefaultLocale: false`) so it lives at the root.
export function localeHomeUrl(locale: string): string {
  return locale === 'de' ? '/' : `/${locale}`;
}

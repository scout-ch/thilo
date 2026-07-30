import type { APIRoute } from 'astro';
import { fetchAllSections } from '../utils/sectionMappings';
import { absoluteUrl } from '../utils/urls';

const LOCALES = ['de', 'fr', 'it'] as const;

type Locale = typeof LOCALES[number];

function sectionUrl(locale: Locale, slug: string): string {
  return absoluteUrl(locale === 'de' ? `/${slug}` : `/${locale}/${slug}`);
}

function pageUrl(locale: Locale, path: string): string {
  return absoluteUrl(locale === 'de' ? path : `/${locale}${path}`);
}

function urlEntry(loc: string, alternates: Array<{ hreflang: string; href: string }>): string {
  const alts = alternates
    .map(a => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`)
    .join('\n');
  return `  <url>\n    <loc>${loc}</loc>\n${alts}\n  </url>`;
}

export const GET: APIRoute = async () => {
  const allSections = await fetchAllSections();
  const entries: string[] = [];

  // Static pages: home, search, impressum
  for (const path of ['/', '/search', '/impressum']) {
    const alternates = [
      ...LOCALES.map(l => ({ hreflang: l, href: pageUrl(l, path) })),
      { hreflang: 'x-default', href: pageUrl('de', path) },
    ];
    for (const locale of LOCALES) {
      entries.push(urlEntry(pageUrl(locale, path), alternates));
    }
  }

  // Section pages — group via the cross-locale mapping so equivalent sections share alternates
  const seenGroups = new Set<object>();
  for (const locale of LOCALES) {
    for (const section of allSections.sections[locale] ?? []) {
      const localeMap = allSections.sectionMappings[section.id.toString()];
      if (!localeMap || seenGroups.has(localeMap)) continue;
      seenGroups.add(localeMap);

      const group = Object.entries(localeMap) as Array<[Locale, { slug: string }]>;
      const deSlug = localeMap['de']?.slug;
      const alternates = [
        ...group.map(([l, info]) => ({ hreflang: l, href: sectionUrl(l, info.slug) })),
        ...(deSlug ? [{ hreflang: 'x-default', href: sectionUrl('de', deSlug) }] : []),
      ];
      for (const [l, info] of group) {
        entries.push(urlEntry(sectionUrl(l, info.slug), alternates));
      }
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${entries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};

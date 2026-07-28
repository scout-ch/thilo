import type { APIRoute, GetStaticPaths } from 'astro';
import { getSections, getStartPage, type SectionT, type StartPageT } from '../../utils/data';
import { extractImageUrls } from '../../utils/markdown';
import { supportedLocales } from '../../i18n';

// Every content image URL the site has, so the client can warm the service
// worker's image cache for pages the reader has not opened (see
// warmImageCache.ts). Without it, offline reading only covers the pages that
// were visited while online, since remote images can't be precached.
//
// Roughly four in five images are the same file in every language, so the list
// covers all of them rather than one locale's. It stays split by locale to
// keep the reader's own language ahead of the rest in the fetch order.
export interface OfflineImageList {
  own: string[];
  others: string[];
}

export const getStaticPaths: GetStaticPaths = () =>
  supportedLocales.map(locale => ({ params: { locale } }));

function collectImageUrls(sections: SectionT[], startPage: StartPageT): Set<string> {
  const urls = new Set<string>();

  for (const url of extractImageUrls(startPage.content)) urls.add(url);

  for (const section of sections) {
    if (section.icon?.url) urls.add(section.icon.url);
    for (const url of extractImageUrls(section.content)) urls.add(url);

    for (const chapter of section.chapters ?? []) {
      for (const url of extractImageUrls(chapter.content)) urls.add(url);
      for (const target of chapter.targets ?? []) {
        for (const url of extractImageUrls(target.content)) urls.add(url);
      }
    }
  }

  return urls;
}

async function imageUrlsForLocale(locale: string): Promise<Set<string>> {
  const [sections, startPage] = await Promise.all([
    getSections(locale),
    getStartPage(locale),
  ]);
  return collectImageUrls(sections, startPage);
}

export const GET: APIRoute = async ({ params }) => {
  // getSections/getStartPage share an in-memory cache across the build, so
  // walking every locale in every locale's endpoint costs one fetch each
  const byLocale = new Map<string, Set<string>>(
    await Promise.all(
      supportedLocales.map(async locale =>
        [locale, await imageUrlsForLocale(locale)] as const
      )
    )
  );

  const own = byLocale.get(params.locale!) ?? new Set<string>();
  const others = new Set<string>();
  for (const [locale, urls] of byLocale) {
    if (locale === params.locale) continue;
    for (const url of urls) {
      if (!own.has(url)) others.add(url);
    }
  }

  const list: OfflineImageList = { own: [...own], others: [...others] };
  return new Response(JSON.stringify(list), {
    headers: { 'Content-Type': 'application/json' },
  });
};

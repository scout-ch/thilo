import type { APIRoute, GetStaticPaths } from 'astro';
import { getSections, getStartPage } from '../../utils/data';
import { extractImageUrls } from '../../utils/markdown';
import { supportedLocales } from '../../i18n';

// Every content image URL of one locale, so the client can warm the service
// worker's image cache for chapters the reader has not opened (see
// warmImageCache.ts). Without it, offline reading only covers the pages that
// were visited while online, since remote images can't be precached.

export const getStaticPaths: GetStaticPaths = () =>
  supportedLocales.map(locale => ({ params: { locale } }));

export const GET: APIRoute = async ({ params }) => {
  const [sections, startPage] = await Promise.all([
    getSections(params.locale!),
    getStartPage(params.locale!),
  ]);
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

  return new Response(JSON.stringify([...urls]), {
    headers: { 'Content-Type': 'application/json' },
  });
};

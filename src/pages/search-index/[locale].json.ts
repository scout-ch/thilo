import type { APIRoute, GetStaticPaths } from 'astro';
import { getSections } from '../../utils/data';
import { stripMarkdown, type SearchIndexEntry, type SearchIndexHeadingChunk } from '../../utils/search';
import { splitContentByHeading } from '../../utils/markdown';

// Static per-locale search index, fetched lazily by the search widget and
// precached by the service worker. Keeps section content out of every page's
// HTML and lets search score plain text instead of raw markdown.

export const getStaticPaths: GetStaticPaths = () =>
  ['de', 'fr', 'it'].map(locale => ({ params: { locale } }));

// In-content headings render with a stable id (renderer.heading in
// markdown.ts), so a chunk anchored to one can deep-link straight to it;
// fallbackAnchor is used for content before the first heading / with none.
function headingChunks(content: string, fallbackAnchor?: string): SearchIndexHeadingChunk[] {
  return splitContentByHeading(content, fallbackAnchor)
    .map(chunk => ({ anchor: chunk.anchor, text: stripMarkdown(chunk.raw) }));
}

export const GET: APIRoute = async ({ params }) => {
  const sections = await getSections(params.locale!);
  const entries: SearchIndexEntry[] = [];

  for (const section of sections) {
    entries.push({
      type: 'section',
      title: section.title,
      text: stripMarkdown(section.content ?? ''),
      slug: section.slug!,
      sectionTitle: section.title,
      color: section.color_primary,
      headings: headingChunks(section.content ?? ''),
    });
    for (const chapter of section.chapters ?? []) {
      const targetTexts = (chapter.targets ?? [])
        .map(target => `${target.title}\n${target.content ?? ''}`)
        .join('\n');
      // Targets don't get their own in-page id (Section.astro only ids the
      // chapter div), so their chunks anchor to the chapter itself.
      const targetChunks: SearchIndexHeadingChunk[] = (chapter.targets ?? []).map(target => ({
        anchor: chapter.slug,
        text: stripMarkdown(`${target.title}\n${target.content ?? ''}`),
      }));
      entries.push({
        type: 'chapter',
        title: chapter.title,
        text: stripMarkdown(`${chapter.content ?? ''}\n${targetTexts}`),
        slug: section.slug!,
        chapterSlug: chapter.slug,
        sectionTitle: section.title,
        color: section.color_primary,
        headings: [...headingChunks(chapter.content ?? '', chapter.slug), ...targetChunks],
      });
    }
  }

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json' },
  });
};

const LOCALE_PREFIXES = ['fr', 'it'];

// Shape of the slimmed-down meta[name="all-sections"] payload built in
// BaseLayout.astro; keep the two in sync.
interface MetaChapter {
  slug: string;
  sorting: number;
}

interface MetaSection {
  id: number;
  slug: string;
  chapters: MetaChapter[];
}

interface AllSectionsMeta {
  sections: Record<string, MetaSection[]>;
  mappings: Record<string, Record<string, { slug: string; url: string }>>;
}

export function handleLanguageChange(targetLocale: string, base: string): void {
  const buildUrl = (path: string) => base + path;
  const currentHash = window.location.hash;

  let path = window.location.pathname;
  if (base && path.startsWith(base)) path = path.slice(base.length);
  path = path.replace(/^\/|\/$/g, '');
  for (const prefix of LOCALE_PREFIXES) {
    if (path === prefix) path = '';
    else if (path.startsWith(prefix + '/')) path = path.substring(prefix.length + 1);
  }

  if (path === 'impressum') {
    window.location.href = targetLocale === 'de'
      ? buildUrl('/impressum')
      : buildUrl(`/${targetLocale}/impressum`);
    return;
  }

  const allSectionsMeta = document
    .querySelector('meta[name="all-sections"]')
    ?.getAttribute('content');
  if (!allSectionsMeta) {
    window.location.href = targetLocale === 'de' ? buildUrl('/') : buildUrl(`/${targetLocale}`);
    return;
  }

  const { sections, mappings }: AllSectionsMeta = JSON.parse(allSectionsMeta);
  const currentLocale = document.documentElement.lang || 'de';
  const currentSection = (sections[currentLocale] ?? []).find((s) => s.slug === path);
  const targetEntry = currentSection
    ? mappings[currentSection.id.toString()]?.[targetLocale]
    : undefined;

  if (currentSection && targetEntry) {
    const targetUrl = buildUrl(targetEntry.url);
    if (currentHash) {
      const targetSection = (sections[targetLocale] ?? []).find(
        (s) => s.slug === targetEntry.slug
      );
      const curChapter = (currentSection.chapters ?? []).find(
        (chapter) => chapter.slug === currentHash.slice(1)
      );
      if (curChapter && targetSection) {
        const tgtChapter = (targetSection.chapters ?? []).find(
          (chapter) => chapter.sorting === curChapter.sorting
        );
        if (tgtChapter) {
          window.location.href = targetUrl + `#${tgtChapter.slug}`;
          return;
        }
      }
    }
    window.location.href = targetUrl;
    return;
  }

  let targetUrl =
    path === 'search'
      ? targetLocale === 'de'
        ? buildUrl('/search')
        : buildUrl(`/${targetLocale}/search`)
      : targetLocale === 'de'
        ? buildUrl('/')
        : buildUrl(`/${targetLocale}`);
  if (window.location.search) targetUrl += window.location.search;
  window.location.href = targetUrl;
}

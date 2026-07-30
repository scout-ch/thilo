import { getSections, type SectionT } from './data';
import { localeHomeUrl } from './urls';

export interface SectionData {
  id: number;
  title: string;
  menu_name: string;
  slug: string;
  locale: string;
  sorting: number;
  color_primary?: string;
  icon?: {
    id: number;
    url: string;
    alternativeText?: string;
  };
  chapters?: Array<{
    id: number;
    title: string;
    slug: string;
    sorting: number;
  }>;
}

export interface SectionLocaleEntry {
  title: string;
  slug: string;
  url: string;
  color_primary?: string;
}

export interface SimpleSectionsData {
  sections: {
    [locale: string]: SectionData[];
  };
  sectionMappings: {
    [sectionId: string]: {
      [locale: string]: SectionLocaleEntry;
    };
  };
}

let cachedAllSections: SimpleSectionsData | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1-hour TTL

function toSectionData(s: SectionT): SectionData {
  return {
    id: s.id,
    title: s.title,
    menu_name: s.menu_name,
    slug: s.slug!,
    locale: s.locale,
    sorting: s.sorting,
    color_primary: s.color_primary,
    icon: s.icon ? { id: s.icon.id, url: s.icon.url, alternativeText: s.icon.alternativeText } : undefined,
    chapters: s.chapters.map(c => ({
      id: c.id,
      title: c.title,
      slug: c.slug!,
      sorting: c.sorting,
    })),
  };
}

export async function fetchAllSections(): Promise<SimpleSectionsData> {
  if (cachedAllSections && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedAllSections;
  }

  const locales = ['de', 'fr', 'it'];
  const sections: { [locale: string]: SectionData[] } = {};

  await Promise.all(locales.map(async (locale) => {
    try {
      const raw = await getSections(locale);
      sections[locale] = raw.map(toSectionData);
    } catch (error) {
      console.error(`❌ Failed to fetch sections for ${locale}:`, error);
      sections[locale] = [];
    }
  }));

  const sectionMappings: SimpleSectionsData['sectionMappings'] = {};
  const sectionsBySort: { [sorting: number]: SectionData[] } = {};

  // Group parallel translations by their sorting order index
  for (const locale of locales) {
    for (const section of sections[locale]) {
      if (!sectionsBySort[section.sorting]) sectionsBySort[section.sorting] = [];
      sectionsBySort[section.sorting].push(section);
    }
  }

  function toLocaleEntry(section: SectionData): SectionLocaleEntry {
    const url = section.locale === 'de'
      ? `/${section.slug}`
      : `/${section.locale}/${section.slug}`;
    return {
      title: section.title,
      slug: section.slug,
      url,
      color_primary: section.color_primary,
    };
  }

  for (const group of Object.values(sectionsBySort)) {
    // Strapi data can contain several sections of the same locale with the same
    // sorting value (e.g. a beta/test section next to the real one). Treat the
    // section with the most chapters as the canonical translation; the others
    // only map to themselves, so language switching falls back to the homepage
    // instead of landing on an unrelated section.
    const canonical: { [locale: string]: SectionData } = {};
    const duplicates: SectionData[] = [];
    for (const section of group) {
      const existing = canonical[section.locale];
      if (!existing) {
        canonical[section.locale] = section;
      } else {
        const winner = (section.chapters?.length ?? 0) > (existing.chapters?.length ?? 0)
          ? section : existing;
        const loser = winner === section ? existing : section;
        canonical[section.locale] = winner;
        duplicates.push(loser);
        console.warn(
          `⚠️ Duplicate sorting=${section.sorting} for locale "${section.locale}": ` +
          `"${winner.title}" (id ${winner.id}) treated as translation, "${loser.title}" (id ${loser.id}) excluded from language switching.`
        );
      }
    }

    const localeMap: { [locale: string]: SectionLocaleEntry } = {};
    for (const section of Object.values(canonical)) {
      localeMap[section.locale] = toLocaleEntry(section);
    }

    // Bind the translation map to every canonical section ID in the group so
    // that looking up mapping[de_id], mapping[fr_id] or mapping[it_id] all resolve.
    for (const section of Object.values(canonical)) {
      sectionMappings[section.id.toString()] = localeMap;
    }
    for (const section of duplicates) {
      sectionMappings[section.id.toString()] = { [section.locale]: toLocaleEntry(section) };
    }
  }

  const result = { sections, sectionMappings };
  cachedAllSections = result;
  cacheTimestamp = Date.now();
  return result;
}

export function getSectionUrlForLocaleFromCache(
  sectionId: string,
  targetLocale: string,
  sectionMappings: SimpleSectionsData['sectionMappings']
): string {
  const mapping = sectionMappings[sectionId];
  if (mapping?.[targetLocale]) return mapping[targetLocale].url;
  return localeHomeUrl(targetLocale);
}

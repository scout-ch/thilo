// Utility functions for the Thilo Astro app - Strapi Data Fetching
import { getSlugForLocale, getSectionIdFromSlug } from './slugMapping';
import { slugify } from './slugify';

const BACKEND_URL = import.meta.env.BACKEND_URL || 'https://api.thilo.scouts.ch/';

const SHOW_DRAFTS = import.meta.env.SHOW_DRAFTS === 'true';

const PUBLICATION_STATE = {
  LIVE: 'live',
  PREVIEW: 'preview'
} as const;

export interface IconT {
  id: number;
  name: string;
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
}

export interface ChapterT {
  id: number;
  title: string;
  content: string;
  sorting: number;
  slug?: string;
  slug_with_section?: string;
  targets?: TargetT[];
  published_at?: string | null;
}

export interface TargetT {
  id: number;
  title: string;
  content: string;
  role: string;
}

export interface SectionT {
  id: number;
  title: string;
  content: string;
  slug?: string;
  sorting: number;
  menu_name: string;
  locale: string;
  color_primary?: string;
  color_primary_light?: string;
  icon?: IconT;
  chapters: ChapterT[];
  published_at?: string | null;
  // Optional SEO overrides: not in the Strapi schema yet, but picked up
  // automatically for meta tags once the fields are added to the backend
  seo_title?: string;
  seo_description?: string;
}

export interface StartPageT {
  id: number;
  title: string;
  content: string;
  menu_name: string;
  locale: string;
}

// Fetch data from Strapi with caching (in-memory, shared across the build)
const dataCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function fetchFromStrapi<T>(endpoint: string, locale: string = 'de'): Promise<T> {
  const cacheKey = `${endpoint}-${locale}`;
  const cached = dataCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }

  // Strapi's default publication state is not guaranteed to be "live", so it is
  // always sent explicitly
  const publicationState = SHOW_DRAFTS ? PUBLICATION_STATE.PREVIEW : PUBLICATION_STATE.LIVE;
  const url = `${BACKEND_URL}${endpoint}?_locale=${locale}&_publicationState=${publicationState}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Strapi v3 responds with flat arrays/objects; the .data unwrap only kicks
  // in if the backend is ever upgraded to the v4+ envelope format
  const processedData = data.data || data;

  dataCache.set(cacheKey, { data: processedData, timestamp: Date.now() });
  return processedData as T;
}

// Get start page data
export async function getStartPage(locale: string = 'de'): Promise<StartPageT> {
  return fetchFromStrapi<StartPageT>('start-page', locale);
}

// Backstop for _publicationState: the backend applies it to sections and their
// populated chapters, but an unpublished entry must never reach a live build
function isVisible(entry: { published_at?: string | null }): boolean {
  return SHOW_DRAFTS || Boolean(entry.published_at);
}

// Get all sections
export async function getSections(locale: string = 'de'): Promise<SectionT[]> {
  const sections = await fetchFromStrapi<SectionT[]>('sections', locale);

  // Add slugs to sections and chapters, and sort chapters by sorting field
  return sections.filter(isVisible).map(section => {
    const generatedSlug = slugify(section.title);
    // Use custom slug if available, otherwise use generated slug
    const customSlug = getSlugForLocale(section.id.toString(), locale);
    const slug = customSlug || generatedSlug;
    
    return {
      ...section,
      slug,
      chapters: section.chapters
        .filter(isVisible)
        .sort((a, b) => (a.sorting || 0) - (b.sorting || 0))
        .map(chapter => ({
          ...chapter,
          slug: slugify(chapter.title),
          slug_with_section: `${slug}#${slugify(chapter.title)}`
        }))
    };
  });
}

// Get section by slug
export async function getSectionBySlug(slug: string, locale: string = 'de'): Promise<SectionT | null> {
  // First try to find by custom slug mapping
  const sectionId = getSectionIdFromSlug(slug, locale);
  if (sectionId) {
    const sections = await getSections(locale);
    return sections.find(section => section.id.toString() === sectionId) || null;
  }
  
  // Fall back to regular slug matching
  const sections = await getSections(locale);
  return sections.find(section => section.slug === slug) || null;
}

// Utility functions for the Thilo Astro app - Strapi Data Fetching

const BACKEND_URL = (import.meta as any).env.BACKEND_URL || 'https://api.thilo.scouts.ch/';

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
}

export interface StartPageT {
  id: number;
  title: string;
  content: string;
  menu_name: string;
  locale: string;
}

export interface LinkT {
  title: string;
  link: string | undefined;
  key: string;
  slug: string | null;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

// Fetch data from Strapi with caching
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchFromStrapi<T>(endpoint: string, locale: string = 'de'): Promise<T> {
  const cacheKey = `${endpoint}-${locale}`;
  const cached = dataCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const url = `${BACKEND_URL}${endpoint}?_locale=${locale}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Filter out unpublished content
    const filteredData = Array.isArray(data) 
      ? data.filter((item: any) => item.published_at !== null)
      : data;
    
    dataCache.set(cacheKey, { data: filteredData, timestamp: Date.now() });
    return filteredData;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// Get start page data
export async function getStartPage(locale: string = 'de'): Promise<StartPageT> {
  return fetchFromStrapi<StartPageT>('start-page', locale);
}

// Get all sections
export async function getSections(locale: string = 'de'): Promise<SectionT[]> {
  const sections = await fetchFromStrapi<SectionT[]>('sections', locale);
  
  // Add slugs to sections and chapters, and sort chapters by sorting field
  return sections.map(section => ({
    ...section,
    slug: slugify(section.title),
    chapters: section.chapters
      .sort((a, b) => (a.sorting || 0) - (b.sorting || 0))
      .map(chapter => ({
        ...chapter,
        slug: slugify(chapter.title),
        slug_with_section: `${slugify(section.title)}#${slugify(chapter.title)}`
      }))
  }));
}

// Get links
export async function getLinks(locale: string = 'de'): Promise<LinkT[]> {
  return fetchFromStrapi<LinkT[]>('links', locale);
}

// Get section by slug
export async function getSectionBySlug(slug: string, locale: string = 'de'): Promise<SectionT | null> {
  const sections = await getSections(locale);
  return sections.find(section => section.slug === slug) || null;
}

// Utility function to create slugs (matching the React app's slugify function)
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Search function
export async function searchContent(query: string, sections: SectionT[]): Promise<any[]> {
  const results: any[] = [];
  const searchTerm = query.toLowerCase();

  sections.forEach(section => {
    // Search in section title and content
    if (section.title.toLowerCase().includes(searchTerm) || 
        section.content.toLowerCase().includes(searchTerm)) {
      results.push({
        type: 'section',
        section: section,
        title: section.title,
        content: section.content,
        url: `/${section.slug}`
      });
    }

    // Search in chapters
    section.chapters.forEach(chapter => {
      if (chapter.title.toLowerCase().includes(searchTerm) || 
          chapter.content.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'chapter',
          section: section,
          chapter: chapter,
          title: chapter.title,
          content: chapter.content,
          url: `/${section.slug}#${chapter.slug}`
        });
      }
    });
  });

  return results;
}

// Format date utility
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('de-CH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Get article by ID (placeholder - articles not implemented yet)
export async function getArticleById(_id: string): Promise<Article | null> {
  // This would fetch from Strapi when articles are implemented
  return null;
}

// Get section by ID (alias for getSectionBySlug)
export async function getSectionById(id: string, locale: string = 'de'): Promise<SectionT | null> {
  return getSectionBySlug(id, locale);
}

// Get articles by section (placeholder - articles not implemented yet)
export async function getArticlesBySection(_sectionId: string): Promise<Article[]> {
  // This would fetch from Strapi when articles are implemented
  return [];
}

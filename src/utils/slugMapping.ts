// Slug mapping for multi-language support
// Maps section content to language-specific slugs

export interface SlugMapping {
  [sectionId: string]: {
    de: string;
    fr: string;
    it: string;
  };
}

// Define the slug mappings for each section across languages
// Using concept keys to map equivalent content across languages
export const slugMappings: SlugMapping = {
  // Scoutism section
  '18': {  // German "Die Pfadi"
    de: 'die-pfadi',
    fr: 'le-scoutisme', 
    it: 'lo-scoutismo'
  },
  '37': {  // French "Le scoutisme"
    de: 'die-pfadi',
    fr: 'le-scoutisme', 
    it: 'lo-scoutismo'
  },
  '44': {  // Italian "Lo scoutismo"
    de: 'die-pfadi',
    fr: 'le-scoutisme', 
    it: 'lo-scoutismo'
  },
  // Orientation section
  '19': {  // German "Orientieren" 
    de: 'orientieren',
    fr: 'orientation',
    it: 'orientarsi'
  },
  '38': {  // French "Orientation"
    de: 'orientieren',
    fr: 'orientation',
    it: 'orientarsi'
  },
  '45': {  // Italian "Orientamento"
    de: 'orientieren',
    fr: 'orientation',
    it: 'orientarsi'
  }
};

export function getSlugForLocale(sectionId: string, locale: string): string | null {
  const mapping = slugMappings[sectionId];
  if (!mapping) return null;
  return mapping[locale as keyof typeof mapping] || null;
}

export function getSectionIdFromSlug(slug: string, locale: string): string | null {
  for (const [sectionId, mapping] of Object.entries(slugMappings)) {
    if (mapping[locale as keyof typeof mapping] === slug) {
      return sectionId;
    }
  }
  return null;
}

export function getAllSlugsForSection(sectionId: string): Array<{locale: string, slug: string}> {
  const mapping = slugMappings[sectionId];
  if (!mapping) return [];

  return Object.entries(mapping).map(([locale, slug]) => ({ locale, slug }));
}

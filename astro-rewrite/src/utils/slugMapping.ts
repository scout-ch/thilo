// Slug mapping for multi-language support
// Maps section content to language-specific slugs

export interface SlugMapping {
  [sectionId: string]: {
    de: string;
    fr: string;
    it: string;
  };
}

// Cross-language section ID mapping
// Maps equivalent sections across different language versions
export const sectionIdMappings = {
  // "Die Pfadi" / "Le scoutisme" / "Lo scoutismo"
  'scoutism': {
    de: '18',  // German section ID for "Die Pfadi"
    fr: '37',  // French section ID for "Le scoutisme" 
    it: '44'   // Italian section ID for "Lo scoutismo"
  },
  // "Orientieren" / "Orientation" / "Orientarsi"
  'orientation': {
    de: '19',  // German section ID for "Orientieren"
    fr: '38',  // French section ID for "Orientation"
    it: '45'   // Italian section ID for "Orientamento"
  }
};

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

// Get the URL for a section in a specific locale
export function getSectionUrlForLocale(sectionId: string, targetLocale: string): string {
  const customSlug = getSlugForLocale(sectionId, targetLocale);
  
  if (customSlug) {
    // Use custom mapping
    if (targetLocale === 'de') {
      return `/${customSlug}`;
    } else {
      return `/${targetLocale}/${customSlug}`;
    }
  }
  
  // If no custom mapping, we need to fallback to homepage for now
  // In a real scenario, we'd need to get the section data for the target locale
  if (targetLocale === 'de') {
    return '/';
  } else {
    return `/${targetLocale}/`;
  }
}

// Get equivalent URLs for language switching
export function getLanguageAlternatives(currentSlug: string, currentLocale: string): Array<{locale: string, url: string}> {
  const sectionId = getSectionIdFromSlug(currentSlug, currentLocale);
  if (!sectionId) return [];
  
  const alternatives = [];
  for (const locale of ['de', 'fr', 'it']) {
    if (locale !== currentLocale) {
      const url = getSectionUrlForLocale(sectionId, locale);
      alternatives.push({ locale, url });
    }
  }
  
  return alternatives;
}

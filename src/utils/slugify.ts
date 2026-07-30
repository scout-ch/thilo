// Shared utilities for slug generation

// German umlauts expand to their digraphs; the French ligatures œ/æ don't
// decompose under NFD, so they need explicit mappings too.
const TRANSLITERATIONS: Record<string, string> = {
  'ä': 'ae',
  'ö': 'oe',
  'ü': 'ue',
  'ß': 'ss',
  'œ': 'oe',
  'æ': 'ae',
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äöüßœæ]/g, (char) => TRANSLITERATIONS[char])
    // Decompose remaining accented characters (é, è, ê, à, ì, ...) and drop the combining marks
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

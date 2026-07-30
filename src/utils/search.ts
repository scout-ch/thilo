import { parseAltDirectives, isLikelyFilename } from './markdown';

// A slice of an entry's content anchored to the heading it falls under (see
// splitContentByHeading in markdown.ts), so a match can deep-link to the
// nearest heading instead of just the containing section/chapter.
export interface SearchIndexHeadingChunk {
  anchor: string | undefined;
  text: string;
}

// One searchable unit, precomputed at build time by search-index/[locale].json
export interface SearchIndexEntry {
  type: 'section' | 'chapter';
  title: string;
  text: string;
  slug: string;
  chapterSlug?: string;
  sectionTitle: string;
  color?: string;
  headings?: SearchIndexHeadingChunk[];
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function highlightHtml(text: string, query: string, bgColor?: string): string {
  if (!query.trim()) return escapeHtml(text);
  const escapedText = escapeHtml(text);
  const escapedQuery = escapeHtml(query);
  const regexEscaped = escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const style = bgColor ? ` style="background-color:${bgColor}"` : '';
  const cls = bgColor ? 'px-1 rounded' : 'bg-yellow-200 px-0.5 rounded';
  return escapedText.replace(
    new RegExp(`(${regexEscaped})`, 'gi'),
    `<mark class="${cls}"${style}>$1</mark>`
  );
}

export function calculateRelevance(
  text: string,
  title: string,
  searchQuery: string,
  isTitle: boolean
): number {
  if (!text && !title) return 0;
  const lowerText = text?.toLowerCase() || '';
  const lowerTitle = title?.toLowerCase() || '';
  const lowerQuery = searchQuery.toLowerCase().trim();
  const target = isTitle ? lowerTitle : lowerText;
  if (!target.includes(lowerQuery)) return 0;

  const esc = lowerQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let score = 0;
  if (target === lowerQuery) score += 1000;
  if (lowerTitle === lowerQuery) score += 800;
  if (lowerTitle.includes(lowerQuery)) score += 500;
  if (new RegExp(`\\b${esc}\\b`).test(lowerTitle)) score += 400;
  if (lowerTitle.startsWith(lowerQuery)) score += 300;
  if (new RegExp(`\\b${esc}\\b`).test(lowerText)) score += 200;
  if (lowerText.startsWith(lowerQuery)) score += 150;
  if (lowerTitle.includes(lowerQuery) && score < 300) score += 100;
  if (lowerText.includes(lowerQuery) && score < 100) score += 50;
  const pos = target.indexOf(lowerQuery);
  if (pos !== -1) score += Math.max(0, 50 - pos);
  score -= Math.min(50, target.length / 100);
  return score;
}

// A result matches if the query appears in the title or the text; the score
// is whichever perspective ranks it higher.
export function scoreResult(title: string, text: string, query: string): number {
  return Math.max(
    calculateRelevance(text, title, query, true),
    calculateRelevance(text, title, query, false),
  );
}

export function stripMarkdown(text: string): string {
  if (!text) return '';
  return text
    // Keep an image's caption as plain, searchable text (skip auto-filled
    // filenames, see isLikelyFilename) instead of discarding it outright.
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, (_match, alt: string) => {
      const { caption } = parseAltDirectives(alt);
      return caption && !isLikelyFilename(caption) ? caption : '';
    })
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/>\s+/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

export function getExcerpt(text: string, query: string, maxLength = 200): string {
  const clean = stripMarkdown(text);
  const lc = clean.toLowerCase();
  const qi = lc.indexOf(query.toLowerCase());
  if (qi === -1) return clean.length > maxLength ? clean.slice(0, maxLength) + '...' : clean;
  const ctx = Math.floor((maxLength - query.length) / 2);
  let start = Math.max(0, qi - ctx);
  let end = Math.min(clean.length, qi + query.length + ctx);
  if (start > 0) {
    const si = clean.lastIndexOf(' ', start);
    if (si > 0 && start - si < 20) start = si + 1;
  }
  if (end < clean.length) {
    const si = clean.indexOf(' ', end);
    if (si > 0 && si - end < 20) end = si;
  }
  return (start > 0 ? '…' : '') + clean.slice(start, end) + (end < clean.length ? '…' : '');
}

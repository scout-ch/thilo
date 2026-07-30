// Build-time markdown rendering for Strapi content.
// Replaces the client-side React MarkdownRenderer so pages ship plain HTML;
// only quizzes remain interactive islands.
import { marked } from 'marked';
import type { Token, Tokens } from 'marked';
import { slugify } from './slugify';
import { getCachedImageDimensions, type ImageDimensions } from './imageDimensions';

const BACKEND_URL = import.meta.env.BACKEND_URL || 'https://api.thilo.scouts.ch/';

export type MarkdownPart =
  | { type: 'html'; value: string }
  | { type: 'quiz'; value: string };

function isQuizLink(href: string | null | undefined): boolean {
  if (!href) return false;
  const h = href.toLowerCase();
  return h.includes('quiz') && h.includes('.json');
}

// Prefix site-internal links (leading slash) with the base path and locale;
// anchors, mailto:, tel: and relative links pass through untouched.
function localizeHref(href: string, base: string, locale: string): string {
  if (!href.startsWith('/')) return href;
  const localePrefix = locale === 'de' ? '' : `/${locale}`;
  return `${base}${localePrefix}${href}`;
}

// Strapi can emit relative upload paths; resolve them against the backend.
function resolveImageSrc(href: string): string {
  if (href.startsWith('/')) return BACKEND_URL.replace(/\/$/, '') + href;
  return href;
}

// Resolved URLs of all images embedded in the given markdown, for probing
// their dimensions (imageDimensions.ts) before rendering.
export function extractImageUrls(content: string | undefined): string[] {
  if (!content) return [];
  return [...content.matchAll(/!\[[^\]]*\]\(\s*([^)\s]+)/g)]
    .map(match => resolveImageSrc(match[1]));
}

// Strapi pre-fills alt text with the uploaded file's name when an editor
// doesn't set one explicitly; that's not a real caption worth showing.
export function isLikelyFilename(text: string): boolean {
  return /^[\w-]+\.(jpe?g|png|gif|webp|svg|bmp|tiff?|avif)$/i.test(text.trim());
}

export interface HeadingChunk {
  // Matches the `id` renderer.heading assigns via slugify(), or the caller's
  // fallbackAnchor for content before the first heading / with no headings.
  anchor: string | undefined;
  raw: string;
}

// Splits raw markdown into chunks at each top-level heading, tagging each
// with the same anchor renderer.heading assigns that heading on the page
// (slugify(text)) - so a search index built from these chunks can deep-link
// straight to the heading nearest a match instead of only the containing
// section/chapter.
export function splitContentByHeading(content: string, fallbackAnchor?: string): HeadingChunk[] {
  // Passed as call-local options (not marked.setOptions) so this can't race
  // with renderMarkdownParts's global gfm/renderer state at build time.
  const tokens = marked.lexer(content || '', { gfm: true });
  const chunks: HeadingChunk[] = [];
  let anchor = fallbackAnchor;
  let raw = '';

  const flush = () => {
    if (raw.trim()) chunks.push({ anchor, raw });
    raw = '';
  };

  for (const token of tokens) {
    if (token.type === 'heading') {
      flush();
      anchor = slugify((token as Tokens.Heading).text ?? '') || fallbackAnchor;
    }
    raw += token.raw ?? '';
  }
  flush();

  return chunks;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Content editors encode CSS and captions in image alt text, e.g.
// "caption: Logo OMMS; width: 300px;" (see README.md). Segments without a
// recognized `tag: value` shape are treated as plain caption/alt prose, so
// descriptive text mixed with directives (or with no directives at all)
// survives instead of being silently dropped.
export function parseAltDirectives(alt: string): { caption: string; styles: Record<string, string> } {
  const styles: Record<string, string> = {};
  const captionParts: string[] = [];
  for (const rawSegment of alt.split(';')) {
    const segment = rawSegment.trim();
    if (!segment) continue;
    const match = segment.match(/^([\w-]+)\s*:\s*(.+)$/);
    if (match && match[1].toLowerCase() === 'caption') {
      captionParts.push(match[2].trim());
    } else if (match) {
      styles[match[1]] = match[2].trim();
    } else {
      captionParts.push(segment);
    }
  }
  return { caption: captionParts.join('; '), styles };
}

// Both attributes must be present for the browser to derive an aspect ratio and
// reserve the image's box, so a lone width/height directive gets its counterpart
// computed from the probed intrinsic size instead of being emitted on its own.
function resolveRenderedSize(
  intrinsic: ImageDimensions | null,
  explicitWidth: number | null,
  explicitHeight: number | null
): Partial<ImageDimensions> {
  if (explicitWidth && explicitHeight) return { width: explicitWidth, height: explicitHeight };
  if (!intrinsic) {
    return { width: explicitWidth ?? undefined, height: explicitHeight ?? undefined };
  }

  const aspectRatio = intrinsic.width / intrinsic.height;
  if (explicitWidth) return { width: explicitWidth, height: Math.round(explicitWidth / aspectRatio) };
  if (explicitHeight) return { width: Math.round(explicitHeight * aspectRatio), height: explicitHeight };
  return intrinsic;
}

function createRenderer(base: string, locale: string) {
  const renderer = new marked.Renderer();

  // Give headings stable ids so in-content anchor links and deep links work
  renderer.heading = function (token: Tokens.Heading): string {
    const inner = this.parser.parseInline(token.tokens);
    const id = slugify(token.text ?? '');
    const idAttr = id ? ` id="${id}"` : '';
    return `<h${token.depth}${idAttr}>${inner}</h${token.depth}>\n`;
  };

  renderer.link = function (token: Tokens.Link): string {
    const { href, title, text } = token;
    const isExternal = href && (href.startsWith('http') || href.startsWith('//'));
    const titleAttr = title ? ` title="${title}"` : '';
    if (isExternal) {
      return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
    return `<a href="${localizeHref(href ?? '', base, locale)}"${titleAttr}>${text}</a>`;
  };

  renderer.image = function (token: Tokens.Image): string {
    const { href, title, text } = token;
    const { caption, styles } = parseAltDirectives(text || '');

    const discardNonNum = (str: string) => +str.replace(/[^0-9]/g, '');
    const explicitWidth = styles.width ? discardNonNum(styles.width) : null;
    const explicitHeight = styles.height ? discardNonNum(styles.height) : null;
    const float = styles.float;
    delete styles.width;
    delete styles.height;
    delete styles.float;

    const src = resolveImageSrc(href ?? '');
    // An explicit width/height directive is an authoring decision and wins; the
    // build-time-probed intrinsic size supplies whatever the directive leaves out
    const { width, height } = resolveRenderedSize(
      getCachedImageDimensions(src),
      explicitWidth,
      explicitHeight
    );

    // crossorigin makes the service worker store a real response instead of an
    // opaque one; opaque entries are padded to several MB each against the
    // origin's storage quota (see the image caches in astro.config.mjs).
    let imgTag = `<img src="${escapeHtml(src)}" alt="${escapeHtml(caption)}" loading="lazy" decoding="async" crossorigin="anonymous"`;
    if (width) imgTag += ` width="${width}"`;
    if (height) imgTag += ` height="${height}"`;
    if (title) {
      // Strapi sometimes stores style information in the title attribute
      if (title.includes('width:') || title.includes('height:') || title.includes('float:')) {
        imgTag += ` style="${title}"`;
      } else {
        imgTag += ` title="${escapeHtml(title)}"`;
      }
    }
    imgTag += ' />';

    // Wrapper must stay inline: marked's default paragraph renderer wraps a
    // standalone `![]()` line in <p>...</p>, and only phrasing content is
    // valid there - a block-level wrapper (e.g. <figure>) would produce
    // invalid nesting that browsers "fix" by splitting the <p> in two.
    // inline-block (not block) so multiple images on the same markdown line
    // render side by side instead of each forcing its own line.
    const wrapperClasses = ['md-img', 'inline-block', 'mb-2'];
    if (float === 'left') wrapperClasses.push('float-left', 'mr-2');
    else if (float === 'right') wrapperClasses.push('float-right', 'ml-2');

    const remainingStyle = Object.entries(styles)
      .map(([prop, value]) => `${prop}: ${value}`).join('; ');
    const styleAttr = remainingStyle ? ` style="${escapeHtml(remainingStyle)}"` : '';

    const captionTag = (caption && !isLikelyFilename(caption))
      ? `<span class="md-img-caption block text-sm italic mt-1">${escapeHtml(caption)}</span>`
      : '';

    return `<span class="${wrapperClasses.join(' ')}"${styleAttr}>${imgTag}${captionTag}</span>`;
  };

  return renderer;
}

// Renders Strapi markdown into alternating HTML and quiz parts. Quiz links
// (URLs containing "quiz" and ".json") become their own parts so the caller
// can mount the interactive quiz island in their place.
export function renderMarkdownParts(content: string, base: string, locale: string): MarkdownPart[] {
  const renderer = createRenderer(base, locale);
  // All parsing below is synchronous, so the module-level options can't leak
  // into a concurrent render with a different base/locale.
  marked.setOptions({ gfm: true, renderer });

  const tokens = marked.lexer(content || '');
  const parts: MarkdownPart[] = [];
  let html = '';

  const flushHtml = () => {
    if (html.trim()) parts.push({ type: 'html', value: html });
    html = '';
  };

  const renderTokens = (blockTokens: Token[]) => marked.parser(blockTokens);

  for (const token of tokens) {
    if (token.type === 'paragraph' && token.tokens?.some((t) => t.type === 'link' && isQuizLink((t as Tokens.Link).href))) {
      flushHtml();
      // Re-parse the surrounding inline markdown (via its raw source) so text
      // next to a quiz link is preserved.
      let rawRemainder = '';
      for (const t of token.tokens as Token[]) {
        if (t.type === 'link' && isQuizLink((t as Tokens.Link).href)) {
          if (rawRemainder.trim()) {
            parts.push({ type: 'html', value: renderTokens(marked.lexer(rawRemainder)) });
          }
          rawRemainder = '';
          parts.push({ type: 'quiz', value: (t as Tokens.Link).href });
        } else {
          rawRemainder += t.raw ?? '';
        }
      }
      if (rawRemainder.trim()) {
        parts.push({ type: 'html', value: renderTokens(marked.lexer(rawRemainder)) });
      }
      continue;
    }

    // Wrap tables so they scroll horizontally on mobile
    if (token.type === 'table') {
      html += `<div class="table-wrapper"><div class="table-inner">${renderTokens([token])}</div></div>`;
      continue;
    }

    html += renderTokens([token]);
  }

  flushHtml();
  return parts;
}

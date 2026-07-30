// Build-time probing of content image dimensions so <img> tags can carry
// width/height attributes and reserve their space (no layout shift while
// images load). Probes fetch only the first bytes when possible; results are
// cached per URL for the whole build.
import { imageSize } from 'image-size';

export interface ImageDimensions {
  width: number;
  height: number;
}

const cache = new Map<string, ImageDimensions | null>();

const PROBE_BYTES = 65536;
const FETCH_TIMEOUT_MS = 10_000;

async function fetchBytes(url: string, partial: boolean): Promise<Uint8Array | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: partial ? { Range: `bytes=0-${PROBE_BYTES - 1}` } : undefined,
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return new Uint8Array(await response.arrayBuffer());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function probeImageDimensions(url: string): Promise<ImageDimensions | null> {
  const cached = cache.get(url);
  if (cached !== undefined) return cached;

  let result: ImageDimensions | null = null;
  // The header bytes are usually enough; some encodings (e.g. JPEG with
  // large metadata) need the full file as a fallback
  for (const partial of [true, false]) {
    const bytes = await fetchBytes(url, partial);
    if (!bytes) break;
    try {
      const size = imageSize(bytes);
      if (size.width && size.height) result = { width: size.width, height: size.height };
      break;
    } catch {
      // dimensions not within the partial bytes: retry with the full file
    }
  }

  if (!result) console.warn(`⚠️ Could not determine image dimensions for ${url}`);
  cache.set(url, result);
  return result;
}

export async function probeImages(urls: string[]): Promise<void> {
  await Promise.all(urls.map(probeImageDimensions));
}

// Synchronous lookup for render paths that cannot await (marked renderers);
// only returns dimensions probed earlier in the build
export function getCachedImageDimensions(url: string): ImageDimensions | null {
  return cache.get(url) ?? null;
}

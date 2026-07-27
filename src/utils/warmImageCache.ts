// Content images live on Cloudinary, so they can't go into the precache: it is
// all-or-nothing on install and cross-origin responses would fail it. Without
// warming, the service worker only ever holds the images of pages that were
// opened while online, and an unvisited chapter reads as text offline. This
// walks the build-time list for the current locale (offline-images/[locale])
// and fetches it through the CacheFirst route in astro.config.mjs. Once warm
// those fetches are served from the cache, so repeat runs cost no network.

const WARM_CONCURRENCY = 4;
const IDLE_TIMEOUT_MS = 5000;
const SESSION_STORAGE_PREFIX = 'thilo-images-warmed-';
const METERED_CONNECTION_TYPES = ['slow-2g', '2g'];
const DEFAULT_LOCALE = 'de';

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

function baseUrl(): string {
  return document.querySelector('meta[name="base-url"]')?.getAttribute('content') ?? '';
}

// A few hundred images is a fair trade on wifi and hostile on a metered phone
// connection, which is exactly where a scout is likely to open this.
function connectionAllowsWarming(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (!connection) return true;
  if (connection.saveData) return false;
  return !METERED_CONNECTION_TYPES.includes(connection.effectiveType ?? '');
}

// Once per session per locale; the cache itself outlives the session (30 days,
// see astro.config.mjs) so re-running on every visit would only re-walk hits.
function claimSessionRun(locale: string): boolean {
  try {
    const key = SESSION_STORAGE_PREFIX + locale;
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, '1');
    return true;
  } catch {
    // Storage denied (private mode, blocked cookies): warm anyway, the fetches
    // are cheap once the cache is populated
    return true;
  }
}

// An uncontrolled page's fetches bypass the worker entirely and cache nothing.
// clientsClaim takes over shortly after a first visit installs the worker.
async function waitForController(): Promise<void> {
  await navigator.serviceWorker.ready;
  if (navigator.serviceWorker.controller) return;
  await new Promise<void>(resolve => {
    navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true });
  });
}

async function fetchInBatches(urls: string[]): Promise<void> {
  let nextIndex = 0;
  const workerCount = Math.min(WARM_CONCURRENCY, urls.length);
  const workers = Array.from({ length: workerCount }, async () => {
    while (nextIndex < urls.length) {
      const url = urls[nextIndex++];
      // A single unreachable image must not abort the rest of the walk
      await fetch(url, { mode: 'cors', credentials: 'omit' }).catch(() => {});
    }
  });
  await Promise.all(workers);
}

async function warmImageCache(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  if (!connectionAllowsWarming()) return;

  const locale = document.documentElement.lang || DEFAULT_LOCALE;
  if (!claimSessionRun(locale)) return;

  await waitForController();

  const response = await fetch(`${baseUrl()}/offline-images/${locale}.json`);
  if (!response.ok) return;
  await fetchInBatches(await response.json());
}

// Warming competes with the page the reader is actually looking at, so it only
// starts once the browser has nothing better to do.
export function scheduleImageCacheWarming(): void {
  const start = () => {
    void warmImageCache().catch(() => {});
  };
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(start, { timeout: IDLE_TIMEOUT_MS });
  } else {
    window.setTimeout(start, IDLE_TIMEOUT_MS);
  }
}

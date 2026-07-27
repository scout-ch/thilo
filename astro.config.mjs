import { defineConfig } from 'astro/config';

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import AstroPWA from '@vite-pwa/astro';

// Image runtime caches carry a version suffix because their entries were once
// written from no-cors requests: an opaque response can never satisfy the
// crossorigin request the <img> tags now make, so the old caches have to be
// abandoned rather than reused. PWAUpdatePrompt deletes the unsuffixed ones.
const CLOUDINARY_IMAGE_CACHE = 'cloudinary-image-cache-v2';
const REMOTE_IMAGE_CACHE = 'image-cache-v2';

// One locale's content is roughly 300 images; the headroom covers section
// icons plus a reader who switches language mid-session.
const CLOUDINARY_IMAGE_CACHE_MAX_ENTRIES = 600;
const REMOTE_IMAGE_CACHE_MAX_ENTRIES = 200;

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

// react-quiz-component appends its entire stylesheet to <head> at import time
// with no opt-out; blank the CSS payload so src/styles/quiz.css is the only
// styling the quiz gets. Throws instead of degrading silently so a package
// update that changes the bundle shape fails the build instead of shipping
// the library's look.
const stripQuizComponentCss = () => ({
  name: 'strip-quiz-component-css',
  transform(code, id) {
    if (!id.includes('react-quiz-component')) return;
    const cssStart = code.indexOf("(':root{--quiz-");
    if (cssStart === -1) {
      throw new Error(
        'react-quiz-component style injection not found; adapt stripQuizComponentCss in astro.config.mjs'
      );
    }
    const cssEnd = code.indexOf("')", cssStart);
    return code.slice(0, cssStart + 1) + "''" + code.slice(cssEnd + 1);
  },
});

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://thilo.scouts.ch',
  base: '/thilo/',
  
  // This satisfies Workbox precaching perfectly across all i18n routes.
  build: {
    format: 'file',
  },
  
  vite: {
    plugins: [tailwindcss(), stripQuizComponentCss()],
    // Pre-bundled deps skip transform plugins in dev; keep the quiz island
    // going through stripQuizComponentCss there too
    optimizeDeps: {
      exclude: ['react-quiz-component'],
    },
  },
  integrations: [
    react(),
    AstroPWA({
      registerType: 'prompt', 
      injectRegister: 'auto',
      
      workbox: {
        // Precache all build output (HTML, JS, CSS, fonts, assets)
        globPatterns: ['**/*.{html,js,css,svg,png,ico,woff,woff2,ttf,json}'],
        cleanupOutdatedCaches: true,
        // Take over the page that installed the worker instead of waiting for
        // the next navigation, so a first visit's images already go through
        // the runtime caches below. skipWaiting stays off: updates are still
        // gated behind the PWAUpdatePrompt toast.
        clientsClaim: true,
        // Strip all query params from precache lookups so ?q=... doesn't break the search page match
        ignoreURLParametersMatching: [/.*/],
        // Do not add `manifestTransforms` here: @vite-pwa/astro only installs
        // its own transform when the key is absent, and that transform is what
        // maps index.html to `base` and strips `.html` off every other route.
        // Without it nothing matches `navigateFallback` (which the integration
        // also derives from `base`) and the SW dies on `non-precached-url`.
        // Cache Strapi API responses (sections, start-page) for offline use
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.thilo\.scouts\.ch\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'strapi-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache Cloudinary images (section content + icons). Status 0 is
          // deliberately not cacheable here: every image request carries
          // crossorigin="anonymous", so a status 0 response means the CORS
          // check failed and the entry would be useless anyway.
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: CLOUDINARY_IMAGE_CACHE,
              expiration: {
                maxEntries: CLOUDINARY_IMAGE_CACHE_MAX_ENTRIES,
                maxAgeSeconds: THIRTY_DAYS_IN_SECONDS,
                purgeOnQuotaError: true,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          // Cache any other remote images by extension (allow trailing query params)
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)(?:\?.*)?$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: REMOTE_IMAGE_CACHE,
              expiration: {
                maxEntries: REMOTE_IMAGE_CACHE_MAX_ENTRIES,
                maxAgeSeconds: THIRTY_DAYS_IN_SECONDS,
                purgeOnQuotaError: true,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
        ],
      },
      manifest: {
        name: "Thilo - Schweizer Pfadi Büchlein",
        short_name: "Thilo",
        description: "Das digitale Handbuch der Schweizer Pfadibewegung",
        start_url: ".",
        scope: ".",
        display: "standalone",
        orientation: "portrait-primary",
        theme_color: "#521d3a",
        background_color: "#521d3a",
        lang: "de",
        categories: ["education", "reference"],
        icons: [
          {
            src: "./pwa-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "./pwa-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "./pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "./favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon"
          }
        ]
      },
      devOptions: {
        enabled: false, 
      },
    }),
  ],
  prefetch: {
    prefetchAll: true,
    // 'viewport' prefetches visible links, which also covers touch devices
    // where 'hover' never fires; the site is small enough for this to be cheap
    defaultStrategy: 'viewport'
  },
  i18n: {
    defaultLocale: "de",
    locales: ["de", "fr", "it"],
    routing: {
      prefixDefaultLocale: false
    }
  },
  outDir: "build"
});

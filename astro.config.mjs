import { defineConfig } from 'astro/config';

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import AstroPWA from '@vite-pwa/astro';

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
          // Cache Cloudinary images (section content + icons)
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-image-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache any other remote images by extension (allow trailing query params)
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)(?:\?.*)?$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
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

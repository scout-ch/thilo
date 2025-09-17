import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  i18n: {
    defaultLocale: "de",
    locales: ["de", "fr", "it", "en"],
    routing: {
      prefixDefaultLocale: false
    }
  },
  // CSS preprocessing removed - using Tailwind CSS
});

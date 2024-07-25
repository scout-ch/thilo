import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import sass from 'sass'


export default defineConfig({
  build: {
    outDir: 'build',
    rollupOptions: {
      input: entryPoints(
        "index.html",
        "404.html",
      )
    }
  },
  base: process.env.REACT_APP_PUBLIC_URL,
  plugins: [react(),
  VitePWA(
    { registerType: 'autoUpdate' }
  )],
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
      },
    },
  },
});

import { join, parse, resolve } from "path";

function entryPoints(...paths) {
  const entries = paths.map(parse).map(entry => {
    const { dir, base, name, ext } = entry;
    const key = join(dir, name);
    const path = resolve(__dirname, dir, base);
    return [key, path];
  });
  
  const config = Object.fromEntries(entries);
  return config;
}
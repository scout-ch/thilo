import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import sass from 'sass'


export default defineConfig({
  build: {
    outDir: 'build'
  }, 
  base: '/thilo/', 
  plugins: [react(), 
    VitePWA(
      {registerType: 'autoUpdate'}
  )],
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
      },
    },
  },
});

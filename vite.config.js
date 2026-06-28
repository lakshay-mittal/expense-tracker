import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    https: process.env.VITE_DEV_HTTPS === 'true',
  },
  plugins: [
    react(),
    process.env.VITE_DEV_HTTPS === 'true' ? mkcert() : null,
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icons.svg', 'manifest.json'],
      manifest: false, // Use physical manifest in public/manifest.json
    })
  ],
})

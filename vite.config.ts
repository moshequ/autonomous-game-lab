import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const basePath = process.env.VITE_BASE_PATH?.trim() || '/'
const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`

export default defineConfig({
  base: normalizedBase,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/maskable-192.png',
        'icons/maskable-512.png',
        'icons/apple-touch-icon.png',
      ],
      manifest: {
        name: 'Autonomous Game Lab',
        short_name: 'Game Lab',
        description: 'A web-first game portal with autonomous analytics and improvement loops.',
        theme_color: '#fbf7ef',
        background_color: '#fbf7ef',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: normalizedBase,
        scope: normalizedBase,
        icons: [
          {
            src: `${normalizedBase}favicon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
          },
          {
            src: `${normalizedBase}icons/icon-192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${normalizedBase}icons/icon-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${normalizedBase}icons/maskable-192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: `${normalizedBase}icons/maskable-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
      },
    }),
  ],
})

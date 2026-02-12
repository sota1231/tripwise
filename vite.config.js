// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    host: true
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['tripwise.jpg'],
      manifest: {
        name: 'TripWise',
        short_name: 'TripWise',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#317EFB',
        icons: [
          {
            src: 'tripwise.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any'
          },
          {
            src: 'tripwise.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any'
          }
        ]
      }
    }),
    // ★ CSPを緩めるためのミドルウェア
    {
      name: 'custom-csp',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader(
            'Content-Security-Policy',
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; object-src 'self'; style-src 'self' 'unsafe-inline'"
          );
          next();
        });
      }
    }
  ],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react'
  }
});

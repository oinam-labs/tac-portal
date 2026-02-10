import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: ['.ngrok-free.app', '.ngrok.io', '.loca.lt'],
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'pwa-icon.svg'],
        manifest: {
          name: 'TAC Cargo Portal',
          short_name: 'TAC Cargo',
          description: 'Enterprise Logistics Management Platform',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          icons: [
            {
              src: 'pwa-icon.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
            },
            {
              src: 'pwa-icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
            },
          ],
        },
      }),
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: 'stats.html',
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['motion', 'lucide-react', 'clsx', 'tailwind-merge'],
            'vendor-data': ['@tanstack/react-query', 'zustand', 'zod', '@hookform/resolvers'],
            'vendor-charts': ['recharts'],
            'vendor-utils': ['date-fns'],
            'vendor-sentry': ['@sentry/react'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  } as any;
});

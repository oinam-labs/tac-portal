import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: ['.ngrok-free.app', '.ngrok.io', '.loca.lt'],
    },
    plugins: [react(), tailwindcss()],
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
  };
});

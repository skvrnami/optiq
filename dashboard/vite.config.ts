import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // Relative paths for assets (works in iframe)
  build: {
    outDir: path.resolve(__dirname, '../app/static/dashboard'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@data': path.resolve(__dirname, './src/data'),
      '@types/*': path.resolve(__dirname, './src/types/*'),
    },
  },
  server: {
    port: 9999,
  },
});

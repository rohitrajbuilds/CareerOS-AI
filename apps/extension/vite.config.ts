import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = resolve(__dirname, 'src');

export default defineConfig({
  plugins: [react()],
  publicDir: resolve(__dirname, 'public'),
  resolve: {
    alias: {
      '@': root,
    },
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(root, 'sidepanel/index.html'),
        popup: resolve(root, 'popup/index.html'),
        options: resolve(root, 'options/index.html'),
        offscreen: resolve(root, 'offscreen/index.html'),
        background: resolve(root, 'background/service-worker.ts'),
        content: resolve(root, 'content/index.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background/[name].js';
          }

          if (chunkInfo.name === 'content') {
            return 'content/[name].js';
          }

          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});

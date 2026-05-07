import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const root = resolve(__dirname, 'src');
const publicDir = resolve(__dirname, 'public');
const manifestPath = resolve(publicDir, 'manifest.json');

function manifestTransformPlugin(mode: string): Plugin {
  return {
    name: 'careeros-manifest-transform',
    apply: 'build',
    writeBundle(outputOptions) {
      const outputDir = outputOptions.dir;
      if (!outputDir) {
        return;
      }

      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as {
        host_permissions?: string[];
      };

      if (mode === 'production') {
        manifest.host_permissions = (manifest.host_permissions ?? []).filter(
          (pattern) => !pattern.includes('localhost'),
        );
      } else {
        manifest.host_permissions = Array.from(
          new Set([...(manifest.host_permissions ?? []), 'http://localhost:8000/*']),
        );
      }

      const targetPath = resolve(outputDir, 'manifest.json');
      writeFileSync(targetPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), manifestTransformPlugin(mode)],
  publicDir,
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
}));

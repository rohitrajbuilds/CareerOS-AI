import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const root = resolve(__dirname, 'src');
const publicDir = resolve(__dirname, 'public');
const manifestPath = resolve(publicDir, 'manifest.json');

type ExtensionEnv = {
  VITE_API_BASE_URL?: string;
};

function getApiHostPermission(env: ExtensionEnv): string | null {
  const apiBaseUrl = env.VITE_API_BASE_URL?.trim();
  if (!apiBaseUrl) {
    return null;
  }

  try {
    const url = new URL(apiBaseUrl);
    return `${url.origin}/*`;
  } catch {
    return null;
  }
}

function manifestTransformPlugin(mode: string, env: ExtensionEnv): Plugin {
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
        background?: {
          service_worker?: string;
        };
        action?: {
          default_popup?: string;
        };
        side_panel?: {
          default_path?: string;
        };
        options_page?: string;
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

      const apiHostPermission = getApiHostPermission(env);
      if (apiHostPermission) {
        manifest.host_permissions = Array.from(
          new Set([...(manifest.host_permissions ?? []), apiHostPermission]),
        );
      }

      const popupEntry = 'src/popup/index.html';
      const sidePanelEntry = 'src/sidepanel/index.html';
      const optionsEntry = 'src/options/index.html';
      const backgroundEntry = 'background/service-worker.js';

      if (existsSync(resolve(outputDir, popupEntry))) {
        manifest.action = {
          ...(manifest.action ?? {}),
          default_popup: popupEntry,
        };
      }

      if (existsSync(resolve(outputDir, sidePanelEntry))) {
        manifest.side_panel = {
          ...(manifest.side_panel ?? {}),
          default_path: sidePanelEntry,
        };
      }

      if (existsSync(resolve(outputDir, optionsEntry))) {
        manifest.options_page = optionsEntry;
      }

      if (existsSync(resolve(outputDir, backgroundEntry))) {
        manifest.background = {
          ...(manifest.background ?? {}),
          service_worker: backgroundEntry,
        };
      }

      const targetPath = resolve(outputDir, 'manifest.json');
      writeFileSync(targetPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, 'VITE_');

  return {
  plugins: [react(), manifestTransformPlugin(mode, env)],
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
            return 'background/service-worker.js';
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
  };
});

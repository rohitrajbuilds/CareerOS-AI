import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const root = resolve(__dirname, 'src');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': root,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [resolve(root, 'test/setup.ts')],
    include: [resolve(root, '**/*.test.ts'), resolve(root, '**/*.test.tsx')],
    coverage: {
      reporter: ['text', 'lcov'],
    },
  },
});

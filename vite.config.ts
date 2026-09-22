import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        landing: resolve(import.meta.dirname, 'index.html'),
        fieldGuide: resolve(import.meta.dirname, 'mockups/field-guide.html'),
        poster: resolve(import.meta.dirname, 'mockups/poster.html'),
        comparison: resolve(import.meta.dirname, 'mockups/index.html'),
        privacy: resolve(import.meta.dirname, 'privacy/index.html'),
        deleteAccount: resolve(import.meta.dirname, 'delete-account/index.html'),
        support: resolve(import.meta.dirname, 'support/index.html'),
      },
    },
  },
});

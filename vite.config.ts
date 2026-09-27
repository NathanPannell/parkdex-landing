import { defineConfig, loadEnv } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createMcpMetadata, createRobotsTxt, createSitemapXml, rewriteStaticAppLinks } from './src/mcp-metadata';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const appUrl = process.env.VITE_APP_URL || env.VITE_APP_URL || 'https://web.parkdex.app';
  const mcpMetadata = createMcpMetadata(appUrl);
  let outputDirectory = 'dist';

  return {
    plugins: [{
      name: 'parkdex-mcp-metadata',
      transformIndexHtml(html) {
        return rewriteStaticAppLinks(html, appUrl);
      },
      configResolved(config) {
        outputDirectory = resolve(config.root, config.build.outDir);
      },
      async writeBundle() {
        const metadataDirectory = resolve(outputDirectory, '.well-known');
        const resourceMetadataDirectory = resolve(metadataDirectory, 'oauth-protected-resource');
        await Promise.all([
          mkdir(metadataDirectory, { recursive: true }),
          mkdir(resourceMetadataDirectory, { recursive: true }),
        ]);
        await Promise.all([
          writeFile(resolve(metadataDirectory, 'oauth-authorization-server'), `${JSON.stringify(mcpMetadata.authorizationServer, null, 2)}\n`),
          writeFile(resolve(resourceMetadataDirectory, 'mcp'), `${JSON.stringify(mcpMetadata.protectedResource, null, 2)}\n`),
          writeFile(resolve(outputDirectory, 'robots.txt'), createRobotsTxt(appUrl)),
          writeFile(resolve(outputDirectory, 'sitemap.xml'), createSitemapXml(appUrl)),
        ]);
      },
    }],
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
  };
});

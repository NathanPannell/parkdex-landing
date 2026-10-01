import { defineConfig, loadEnv, type UserConfig } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { KIP_APP_ORIGINS } from './src/app-origins';
import { applyBadgeCount, fetchBadgeCount } from './lib/badge-count';
import { createMcpMetadata, createRobotsTxt, createSitemapXml, rewriteStaticAppLinks } from './src/mcp-metadata';

export default defineConfig(async ({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  // Vercel Git deploys of the staging branch build against the staging app.
  const branchAppUrl = process.env.VERCEL_GIT_COMMIT_REF === 'staging' ? KIP_APP_ORIGINS.staging : KIP_APP_ORIGINS.production;
  const appUrl = process.env.VITE_APP_URL || env.VITE_APP_URL || branchAppUrl;
  const mcpMetadata = createMcpMetadata(appUrl);
  // Bake in the live badge count; the page refreshes it at runtime from /api/badge-count.
  const badgeCount = command === 'build' ? await fetchBadgeCount(appUrl) : null;
  let outputDirectory = 'dist';

  const config: UserConfig = {
    plugins: [{
      name: 'parkdex-mcp-metadata',
      transformIndexHtml(html) {
        const linked = rewriteStaticAppLinks(html, appUrl);
        return badgeCount === null ? linked : applyBadgeCount(linked, badgeCount);
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
  return config;
});

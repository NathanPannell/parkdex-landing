import { defineConfig, loadEnv } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { KIP_APP_ORIGINS } from './src/app-origins';
import { renderBadgeList, renderMarquee, renderWall } from './src/badge-cards';
import { renderFooter, renderNav } from './src/site-shell';
import badgeData from './src/badges.json';
import { createMcpMetadata, createRobotsTxt, createSitemapXml, rewriteStaticAppLinks } from './src/mcp-metadata';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  // Vercel Git deploys of the staging branch build against the staging app.
  const branchAppUrl = process.env.VERCEL_GIT_COMMIT_REF === 'staging' ? KIP_APP_ORIGINS.staging : KIP_APP_ORIGINS.production;
  const appUrl = process.env.VITE_APP_URL || env.VITE_APP_URL || branchAppUrl;
  const mcpMetadata = createMcpMetadata(appUrl);
  let outputDirectory = 'dist';

  return {
    plugins: [{
      name: 'parkdex-mcp-metadata',
      transformIndexHtml(html) {
        // Badge cards come from src/badges.json, refreshed by `npm run sync-badges`.
        return rewriteStaticAppLinks(html, appUrl)
          .replace('<!-- badge-marquee -->', renderMarquee(badgeData.badges))
          .replace('<!-- badge-wall -->', renderWall(badgeData.badges))
          .replace('<!-- badge-list -->', renderBadgeList(badgeData.badges))
          .replace(/<!-- site-nav:([a-z-]+) -->/, (_match, active: string) => renderNav(active))
          .replace('<!-- site-footer -->', renderFooter());
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
          badges: resolve(import.meta.dirname, 'badges/index.html'),
          nearMe: resolve(import.meta.dirname, 'near-me/index.html'),
          dayTrips: resolve(import.meta.dirname, 'day-trips/index.html'),
          tripVictoria: resolve(import.meta.dirname, 'day-trips/victoria-oak-bay/index.html'),
          tripSooke: resolve(import.meta.dirname, 'day-trips/sooke/index.html'),
        },
      },
    },
  };
});

import { defineConfig, loadEnv } from 'vite';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { KIP_APP_ORIGINS } from './src/app-origins';
import { renderFlagCloth, renderFlagHill, renderParkDots } from './src/flag-art';
import { applyHomeMedia, homeMediaMode } from './src/home-media';
import { renderFooter, renderFooterFine, renderNav } from './src/site-shell';
import parkData from './src/parks.json';
import basemap from './src/park-basemap.json';
import { createRobotsTxt, createSitemapXml, rewriteStaticAppLinks } from './src/site-metadata';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'HOME_']);
  // Vercel Git deploys of the staging branch build against the staging app.
  const branchAppUrl = process.env.VERCEL_GIT_COMMIT_REF === 'staging' ? KIP_APP_ORIGINS.staging : KIP_APP_ORIGINS.production;
  const appUrl = process.env.VITE_APP_URL || env.VITE_APP_URL || branchAppUrl;
  // Moving or still app screens on the homepage; see src/home-media.ts.
  const homeMedia = homeMediaMode(process.env.HOME_MEDIA || env.HOME_MEDIA);
  let outputDirectory = 'dist';

  return {
    plugins: [{
      name: 'parkdex-site-metadata',
      transformIndexHtml(html) {
        // Parks come from src/parks.json, refreshed from production by `npm run sync-parks`.
        return applyHomeMedia(rewriteStaticAppLinks(html, appUrl), homeMedia, resolve(import.meta.dirname, 'public'), command === 'build')
          .replace(/<!-- flag-cloth:([a-z-]+) -->/g, (_match, seed: string) => renderFlagCloth(seed))
          .replace('<!-- flag-hill -->', renderFlagHill())
          .replace('<!-- park-dots -->', renderParkDots(parkData.parks, basemap))
          .replace('<!-- park-count -->', parkData.parks.length.toLocaleString('en-CA'))
          .replace(/<!-- site-nav:([a-z-]+) -->/, (_match, active: string) => renderNav(active))
          .replace('<!-- site-footer -->', renderFooter())
          .replace('<!-- footer-fine -->', renderFooterFine());
      },
      configResolved(config) {
        outputDirectory = resolve(config.root, config.build.outDir);
      },
      async writeBundle() {
        await Promise.all([
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
          nearMe: resolve(import.meta.dirname, 'near-me/index.html'),
        },
      },
    },
  };
});

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// The homepage app screens come as stills and as moving loops. Each <img>
// carries its still in src and its loop in data-motion. HOME_MEDIA picks one at
// build time: "motion" (the default) offers the loop through <picture>, so
// browsers that ask for reduced motion still get the still; "still" drops the
// loops. Flip it in the Vercel project's environment variables and redeploy.
export type HomeMedia = 'motion' | 'still';

export function homeMediaMode(value: string | undefined): HomeMedia {
  const mode = (value ?? 'motion').trim().toLowerCase();
  if (mode !== 'motion' && mode !== 'still') throw new Error(`HOME_MEDIA must be "motion" or "still", not "${value}"`);
  return mode;
}

const IMG_WITH_MOTION = /<img ([^>]*?)data-motion="([^"]+)"([^>]*?)\/>/g;

// A build refuses a loop missing from public/ (strict). The dev server keeps
// the still for it instead, so the page works while loops are being made.
export function applyHomeMedia(html: string, mode: HomeMedia, publicDir?: string, strict = true): string {
  return html.replace(IMG_WITH_MOTION, (_match, before: string, motion: string, after: string) => {
    const img = `<img ${before}${after.trimStart()}/>`.replace(/\s+\/>$/, ' />');
    if (mode === 'still') return img;
    if (publicDir && !existsSync(resolve(publicDir, `.${motion}`))) {
      if (strict) throw new Error(`HOME_MEDIA=motion but ${motion} is missing from public/`);
      return img;
    }
    return `<picture><source media="(prefers-reduced-motion: no-preference)" srcset="${motion}" type="image/webp" />${img}</picture>`;
  });
}

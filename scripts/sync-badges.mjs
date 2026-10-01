// Pulls every park that has badge art from the live Parkdex catalogue and
// writes small copies of the art plus a data file the landing page renders.
// Run with `npm run sync-badges`, review the diff, and commit it.
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

// Staging carries far more finished badges than production for now. Set
// PARKDEX_APP_ORIGIN=https://web.parkdex.app to sync from production instead.
const appOrigin = process.env.PARKDEX_APP_ORIGIN || 'https://staging.web.parkdex.app';
const root = resolve(import.meta.dirname, '..');
const artDirectory = resolve(root, 'public/badges');
const dataFile = resolve(root, 'src/badges.json');

const response = await fetch(`${appOrigin}/api/content/snapshot`, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Snapshot request failed with HTTP ${response.status}`);
const snapshot = await response.json();

// Parks without a scene are catalogue entries that have no badge art yet.
const parks = snapshot.parks.filter((park) => typeof park.scene === 'string' && park.scene.trim() !== '');
const assetByPath = new Map(snapshot.assets.map((asset) => [asset.path, asset]));

await mkdir(artDirectory, { recursive: true });
const badges = [];
for (const park of parks) {
  const asset = assetByPath.get(`art/badges/scenes/${park.scene}.webp`);
  if (!asset) throw new Error(`No art asset for ${park.id} (${park.scene})`);
  const art = await fetch(asset.url, { signal: AbortSignal.timeout(30000) });
  if (!art.ok) throw new Error(`Art request for ${park.scene} failed with HTTP ${art.status}`);
  const image = Buffer.from(await art.arrayBuffer());
  await writeFile(resolve(artDirectory, `${park.scene}.webp`), await sharp(image).resize(320, 320, { fit: 'cover' }).webp({ quality: 74 }).toBuffer());
  badges.push({ id: park.id, name: park.name, short: park.short, rarity: park.rarity, biome: park.biome, category: park.category, scene: park.scene, blurb: park.blurb, lat: park.lat, lng: park.lng, shape: park.shape, seed: park.seed });
}

// Drop art for parks that no longer have a badge so stale files do not ship.
const keep = new Set(badges.map((badge) => `${badge.scene}.webp`));
for (const file of await readdir(artDirectory)) {
  if (!keep.has(file)) await rm(resolve(artDirectory, file));
}

await writeFile(dataFile, `${JSON.stringify({ source: appOrigin, revision: snapshot.revision, badges }, null, 2)}\n`);
console.log(`Wrote ${badges.length} badges from ${appOrigin} revision ${snapshot.revision}`);

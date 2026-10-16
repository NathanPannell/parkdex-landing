// Pulls every park in the live Parkdex catalogue and writes the small data file
// the landing map and park count render. Run with `npm run sync-parks`, review
// the diff, and commit it. The page never calls the app at runtime, so a
// visitor never wakes the app's database.
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// The landing map follows production. Set
// PARKDEX_APP_ORIGIN=https://staging.web.parkdex.app to preview staging's catalogue.
const appOrigin = process.env.PARKDEX_APP_ORIGIN || 'https://web.parkdex.app';
const dataFile = resolve(import.meta.dirname, '..', 'src/parks.json');

const response = await fetch(`${appOrigin}/api/content/snapshot`, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Snapshot request failed with HTTP ${response.status}`);
const snapshot = await response.json();

const round = (value) => Math.round(value * 1e5) / 1e5;
const parks = snapshot.parks
  .filter((park) => Number.isFinite(park.lat) && Number.isFinite(park.lng))
  .map((park) => ({ id: park.id, name: park.name, category: park.category, region: park.region, lat: round(park.lat), lng: round(park.lng) }))
  .sort((a, b) => a.id.localeCompare(b.id));

await writeFile(dataFile, `${JSON.stringify({ source: appOrigin, revision: snapshot.revision, parks })}\n`);
console.log(`Wrote ${parks.length} parks from ${appOrigin} revision ${snapshot.revision}`);

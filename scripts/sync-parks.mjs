// Pulls every British Columbia park in the live Parkdex catalogue and writes the
// small data file the landing map and park count render. Run with
// `npm run sync-parks`, review the diff, and commit it. The page never calls the
// app's catalogue at runtime, so a visitor never wakes the app's database for it.
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// The landing map follows production. Set
// PARKDEX_APP_ORIGIN=https://staging.web.parkdex.app to preview staging's catalogue.
const appOrigin = process.env.PARKDEX_APP_ORIGIN || 'https://web.parkdex.app';
const dataFile = resolve(import.meta.dirname, '..', 'src/parks.json');
// Reader 3 gets the whole catalogue. Older readers get only the first Vancouver
// Island parks: everything imported since has a reader floor of 3.
const READER = 3;
// The catalogue covers BC and Nova Scotia. The homepage map shows BC, which is
// everything west of 100°W.
const isBritishColumbia = (park) => park.lng < -100;

async function getJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${url} failed with HTTP ${response.status}`);
  return response;
}

const snapshot = await (await getJson(`${appOrigin}/api/content/snapshot?reader=${READER}`)).json();
const parks = new Map();
let revision = snapshot.revision;
if (snapshot.catalogue) {
  // The snapshot names an immutable CDN catalogue built at `revision`.
  const { indexUrl, indexSha256 } = snapshot.catalogue;
  const bytes = Buffer.from(await (await getJson(indexUrl)).arrayBuffer());
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (sha256 !== indexSha256) throw new Error(`Catalogue index hash ${sha256} does not match ${indexSha256}`);
  for (const park of JSON.parse(bytes.toString('utf8')).parks) parks.set(park.id, park);
} else {
  for (const park of snapshot.parks) parks.set(park.id, park);
}

// Then replay the park edits made since that revision.
for (let more = true; more;) {
  const changes = await (await getJson(`${appOrigin}/api/content/changes?after=${revision}&limit=50&reader=${READER}`)).json();
  for (const batch of changes.batches) {
    for (const change of batch.changes) {
      if (change.entity !== 'park') continue;
      if (change.op === 'upsert') parks.set(change.id, change.value);
      else if (change.op === 'delete') parks.delete(change.id);
    }
  }
  revision = changes.throughRevision;
  more = changes.hasMore;
}

const round = (value) => Math.round(value * 1e5) / 1e5;
const bcParks = [...parks.values()]
  .filter((park) => Number.isFinite(park.lat) && Number.isFinite(park.lng) && isBritishColumbia(park))
  .map((park) => ({ id: park.id, name: park.name, category: park.category, region: park.region, lat: round(park.lat), lng: round(park.lng) }))
  .sort((a, b) => a.id.localeCompare(b.id));

await writeFile(dataFile, `${JSON.stringify({ source: appOrigin, revision, parks: bcParks })}\n`);
console.log(`Wrote ${bcParks.length} BC parks (of ${parks.size}) from ${appOrigin} revision ${revision}`);

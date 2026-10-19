import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderParkDots } from "../src/flag-art.ts";

const data = JSON.parse(await readFile(new URL("../src/parks.json", import.meta.url), "utf8"));
const basemap = JSON.parse(await readFile(new URL("../src/park-basemap.json", import.meta.url), "utf8"));
const page = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("the park map and count come from the production catalogue's BC parks", () => {
  assert.equal(data.source, "https://web.parkdex.app");
  // More than the first Vancouver Island parks that older app readers get.
  assert.ok(data.parks.length > 1000, String(data.parks.length));
  for (const park of data.parks) {
    assert.ok(park.id && park.name, JSON.stringify(park));
    assert.ok(Number.isFinite(park.lat) && Number.isFinite(park.lng), park.id);
    assert.ok(park.lng < -100, `${park.id} is outside BC`);
  }
});

test("the park map draws one dot per park, every one on the basemap and named by its park", () => {
  const svg = renderParkDots(data.parks, basemap);
  assert.match(svg, /<image href="\/images\/park-basemap.webp"/);
  const dots = [...svg.matchAll(/class="dots__dot [^"]+" data-park="([^"]+)" cx="(-?\d+)" cy="(-?\d+)"/g)];
  assert.equal(dots.length, data.parks.length);
  assert.deepEqual(dots.map(([, id]) => id), data.parks.map((park: { id: string }) => park.id));
  for (const [, , x, y] of dots) {
    assert.ok(Number(x) >= 0 && Number(x) <= basemap.width && Number(y) >= 0 && Number(y) <= basemap.height, `${x},${y}`);
  }
  assert.match(svg, new RegExp(`aria-label="Map of ${data.parks.length} Parkdex parks across British Columbia"`));
  // Flags are live: the page plants them in the browser, never at build time.
  assert.match(svg, /<g class="dots__flags"><\/g><\/svg>$/);
  assert.doesNotMatch(svg, /dots__flag"/);
});

test("the homepage names points without promising specific values", () => {
  assert.doesNotMatch(page, /\+\d+|\d+ points?|point an hour|points? (an|per|every) hour/i);
});

test("the homepage pitches the flag game, not the retired park badges", () => {
  assert.doesNotMatch(page, /badge/i);
  assert.match(page, /Plant your flag/);
});

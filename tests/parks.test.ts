import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderParkDots } from "../src/flag-art.ts";

const data = JSON.parse(await readFile(new URL("../src/parks.json", import.meta.url), "utf8"));
const page = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("the park map and count come from the production catalogue", () => {
  assert.equal(data.source, "https://web.parkdex.app");
  assert.ok(data.parks.length > 0);
  for (const park of data.parks) {
    assert.ok(park.id && park.name, JSON.stringify(park));
    assert.ok(Number.isFinite(park.lat) && Number.isFinite(park.lng), park.id);
  }
});

test("the dot map draws one dot per park", () => {
  const svg = renderParkDots(data.parks);
  assert.equal((svg.match(/class="dots__dot /g) ?? []).length, data.parks.length);
  assert.match(svg, new RegExp(`aria-label="${data.parks.length} Parkdex parks`));
});

test("the homepage pitches the flag game, not the retired park badges", () => {
  assert.doesNotMatch(page, /badge/i);
  assert.match(page, /Plant your flag/);
});

import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { appOriginForRequest, applyBadgeCount, countBadgeParks, createBadgeCountHandler } from "../lib/badge-count.ts";

const snapshot = {
  parks: [
    { id: "a", scene: "east-sooke" },
    { id: "b", scene: null },
    { id: "c", scene: "" },
    { id: "d" },
    { id: "e", scene: "thetis-lake" },
  ],
};

function stubFetch(body: unknown, status = 200, seen: string[] = []): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    seen.push(String(input));
    return new Response(JSON.stringify(body), { status });
  }) as typeof fetch;
}

test("counts only parks with a scene", () => {
  assert.equal(countBadgeParks(snapshot), 2);
  assert.equal(countBadgeParks({}), null);
  assert.equal(countBadgeParks(null), null);
});

test("reads the matching environment's catalogue", () => {
  assert.equal(appOriginForRequest("https://parkdex.app/api/badge-count", undefined), "https://web.parkdex.app");
  assert.equal(appOriginForRequest("https://staging.parkdex.app/api/badge-count", undefined), "https://staging.web.parkdex.app");
  assert.equal(appOriginForRequest("https://x.vercel.app/api/badge-count", "staging"), "https://staging.web.parkdex.app");
  assert.equal(appOriginForRequest("https://x.vercel.app/api/badge-count", "main"), "https://web.parkdex.app");
});

test("serves a CDN-cacheable count", async () => {
  const seen: string[] = [];
  const response = await createBadgeCountHandler(stubFetch(snapshot, 200, seen))(new Request("https://parkdex.app/api/badge-count"));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, count: 2 });
  assert.match(response.headers.get("Cache-Control") ?? "", /s-maxage=3600/);
  assert.deepEqual(seen, ["https://web.parkdex.app/api/content/snapshot"]);
});

test("fails uncached when the catalogue is unavailable", async () => {
  const response = await createBadgeCountHandler(stubFetch({}, 503))(new Request("https://parkdex.app/api/badge-count"));
  assert.equal(response.status, 502);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  const post = await createBadgeCountHandler(stubFetch(snapshot))(new Request("https://parkdex.app/api/badge-count", { method: "POST" }));
  assert.equal(post.status, 405);
});

test("bakes the count into every place the landing page states it", async () => {
  const html = applyBadgeCount(await readFile(new URL("../index.html", import.meta.url), "utf8"), 18);
  assert.match(html, /property="og:description" content="18 park badges/);
  assert.match(html, /name="twitter:description" content="18 park badges/);
  assert.match(html, /data-count="18" aria-hidden="true">00</);
  assert.match(html, /<span class="outdoor-sr-only">18<\/span> park badges/);
});

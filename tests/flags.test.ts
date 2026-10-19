import assert from "node:assert/strict";
import test from "node:test";
import { createFlagsHandler, liveFlags } from "../lib/flags.ts";
import { layoutFlagPins, renderFlagPin, weatherForDays } from "../src/flag-art.ts";

const FLAG = { parkId: "osm-way-23612214", handle: "fern_finn", flagSeed: "b61b651c7c5f3932", since: "2026-10-13T22:07:36.602Z", crew: { size: 1 }, patches: ["founder"] };

function upstream(body: unknown, status = 200) {
  const calls: string[] = [];
  const fetchStub = (async (url: string) => {
    calls.push(String(url));
    return Response.json(body, { status });
  }) as typeof fetch;
  return { calls, fetchStub };
}

test("mirrors the app's flags with only what the map draws, cached at the CDN", async () => {
  const { calls, fetchStub } = upstream({ flags: [FLAG], founders: [], serverTime: "2026-10-19T20:00:00.000Z" });
  const handle = createFlagsHandler({ appOrigin: "https://web.parkdex.app", fetch: fetchStub });
  const response = await handle(new Request("https://parkdex.app/api/flags"));
  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["https://web.parkdex.app/api/game/flags"]);
  assert.deepEqual(await response.json(), {
    flags: [{ parkId: FLAG.parkId, flagSeed: FLAG.flagSeed, since: FLAG.since }],
    serverTime: "2026-10-19T20:00:00.000Z",
  });
  assert.match(response.headers.get("Cache-Control") ?? "", /s-maxage=300/);
});

test("drops malformed flags and refuses a malformed or failed upstream without caching", async () => {
  assert.deepEqual(liveFlags({ flags: [FLAG, { ...FLAG, parkId: "<script>" }, { ...FLAG, flagSeed: 7 }, { ...FLAG, since: "soon" }, null] }), [
    { parkId: FLAG.parkId, flagSeed: FLAG.flagSeed, since: FLAG.since },
  ]);
  assert.equal(liveFlags({ flags: "none" }), null);
  for (const [body, status] of [[{ nope: true }, 200], [{ error: "down" }, 503]] as const) {
    const handle = createFlagsHandler({ appOrigin: "https://web.parkdex.app", fetch: upstream(body, status).fetchStub });
    const response = await handle(new Request("https://parkdex.app/api/flags"));
    assert.equal(response.status, 502);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
  }
  const offline = createFlagsHandler({ appOrigin: "https://web.parkdex.app", fetch: (async () => { throw new TypeError("offline"); }) as typeof fetch });
  assert.equal((await offline(new Request("https://parkdex.app/api/flags"))).status, 502);
});

test("only answers reads", async () => {
  const { calls, fetchStub } = upstream({ flags: [] });
  const handle = createFlagsHandler({ appOrigin: "https://web.parkdex.app", fetch: fetchStub });
  assert.equal((await handle(new Request("https://parkdex.app/api/flags", { method: "POST" }))).status, 405);
  assert.equal(calls.length, 0);
});

test("flags on one spot fan out, and a crowd shows a count", () => {
  const spot = (x: number, seed: string) => ({ x, y: 500, seed, weather: 0 as const });
  const pins = layoutFlagPins([spot(300, "a"), spot(305, "b"), spot(310, "c"), spot(302, "d"), spot(301, "e"), spot(304, "f"), spot(900, "g")]);
  assert.equal(pins.length, 4);
  assert.deepEqual(pins.slice(0, 3).map((pin) => pin.x), [180, 300, 420]);
  assert.deepEqual(pins.map((pin) => pin.label), [undefined, undefined, "+3", undefined]);
  assert.deepEqual(pins.at(-1), spot(900, "g"));
  const svg = pins.map(renderFlagPin).join("");
  assert.equal(svg.match(/class="dots__flag"/g)?.length, 4);
  assert.match(svg, />\+3<\/text>/);
});

test("flag weather matches the app", () => {
  assert.deepEqual([0, 6, 7, 20, 21, 29].map(weatherForDays), [0, 0, 1, 1, 2, 2]);
});

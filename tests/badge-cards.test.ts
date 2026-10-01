import assert from "node:assert/strict";
import test from "node:test";
import { renderBadgeList, renderDexPage, type Badge } from "../src/badge-cards.ts";
import badgeData from "../src/badges.json" with { type: "json" };

const badge = (short: string, rarity: string): Badge => ({ id: short, name: `${short} Park`, short, rarity, biome: "forest", scene: short.toLowerCase(), blurb: "" });

test("dex page leads with the rarest badges and adds empty slots", () => {
  const html = renderDexPage([badge("Zed", "common"), badge("Amy", "uncommon"), badge("Bo", "rare")], 2, 3);
  assert.deepEqual([...html.matchAll(/dex-slot__ribbon">([^<]+)/g)].map((m) => m[1]), ["Bo", "Amy"]);
  assert.equal((html.match(/dex-slot--empty/g) ?? []).length, 3);
});

test("park names are escaped", () => {
  assert.match(renderDexPage([badge("<b>&", "common")]), /&#60;b&#62;&#38;/);
});

test("badge entries carry lowercase search text", () => {
  assert.match(renderBadgeList([badge("Bo", "rare")]), /data-search="bo park bo rare park "/);
});

test("every synced badge has its art committed", async () => {
  const { access } = await import("node:fs/promises");
  assert.ok(badgeData.badges.length > 0);
  for (const item of badgeData.badges) {
    await access(new URL(`../public/badges/${item.scene}.webp`, import.meta.url));
  }
});

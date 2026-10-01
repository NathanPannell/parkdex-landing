import assert from "node:assert/strict";
import test from "node:test";
import { renderBadgeList, renderBadgeWall, type Badge } from "../src/badge-cards.ts";
import { renderBadgeSvg } from "../src/badge-svg.ts";
import badgeData from "../src/badges.json" with { type: "json" };

const badge = (short: string, rarity: string): Badge => ({ id: short, name: `${short} Park`, short, rarity, biome: "forest", scene: short.toLowerCase(), blurb: "" });

test("wall fills every row and hides tiles from keyboard focus", () => {
  const html = renderBadgeWall([badge("Zed", "common"), badge("Bo", "rare")], 4, 3);
  assert.equal((html.match(/class="wall-row/g) ?? []).length, 3);
  assert.equal((html.match(/class="wall-tile"/g) ?? []).length, 12);
  assert.equal((html.match(/tabindex="-1"/g) ?? []).length, 12);
  assert.equal((html.match(/wall-row--offset/g) ?? []).length, 1);
});

test("badges carry stars, holo for rare ones, and an escaped ribbon", () => {
  const common = renderBadgeSvg({ ...badge("<b>&", "common"), shape: "circle" });
  assert.equal((common.match(/<polygon /g) ?? []).length, 1);
  assert.doesNotMatch(common, /badge-svg__holo/);
  assert.match(common, /&#60;B&#62;&#38;/);
  assert.match(common, /badge-clip-circle/);
  const rare = renderBadgeSvg(badge("Bo", "rare"));
  assert.equal((rare.match(/<polygon /g) ?? []).length, 3);
  assert.match(rare, /badge-svg__holo/);
  assert.match(rare, /badge-clip-hex/);
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

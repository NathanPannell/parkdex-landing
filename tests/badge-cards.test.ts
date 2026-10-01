import assert from "node:assert/strict";
import test from "node:test";
import { renderMarquee, renderWall, type Badge } from "../src/badge-cards.ts";
import badgeData from "../src/badges.json" with { type: "json" };

const badge = (short: string, rarity: string): Badge => ({ id: short, name: `${short} Park`, short, rarity, biome: "forest", scene: short.toLowerCase(), blurb: "" });

test("marquee repeats each row once, hiding the copies from screen readers", () => {
  const html = renderMarquee([badge("A", "common"), badge("B", "rare"), badge("C", "common")]);
  assert.equal((html.match(/<ul class="badge-marquee__row/g) ?? []).length, 2);
  assert.equal((html.match(/<li /g) ?? []).length, 6);
  assert.equal((html.match(/aria-hidden="true"/g) ?? []).length, 3);
});

test("wall leads with the rarest badges", () => {
  const html = renderWall([badge("Zed", "common"), badge("Amy", "uncommon"), badge("Bo", "rare")]);
  assert.deepEqual([...html.matchAll(/badge-card__name">([^<]+)/g)].map((m) => m[1]), ["Bo", "Amy", "Zed"]);
});

test("park names are escaped", () => {
  assert.match(renderWall([badge("<b>&", "common")]), /&#60;b&#62;&#38;/);
});

test("every synced badge has its art committed", async () => {
  const { access } = await import("node:fs/promises");
  assert.ok(badgeData.badges.length > 0);
  for (const item of badgeData.badges) {
    await access(new URL(`../public/badges/${item.scene}.webp`, import.meta.url));
  }
});

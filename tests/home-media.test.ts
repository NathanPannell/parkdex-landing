import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { applyHomeMedia, homeMediaMode } from "../src/home-media.ts";

const page = await readFile(new URL("../index.html", import.meta.url), "utf8");
const publicDir = new URL("../public", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

test("HOME_MEDIA defaults to motion and accepts only motion or still", () => {
  assert.equal(homeMediaMode(undefined), "motion");
  assert.equal(homeMediaMode(" Still "), "still");
  assert.throws(() => homeMediaMode("gif"));
});

test("still mode keeps every screen as a plain image", () => {
  const html = applyHomeMedia(page, "still", publicDir);
  assert.doesNotMatch(html, /data-motion|<picture/);
});

test("motion mode offers every loop, but only to visitors who have not asked for reduced motion", () => {
  const loops = (page.match(/data-motion="/g) ?? []).length;
  assert.ok(loops >= 7);
  const html = applyHomeMedia(page, "motion", publicDir);
  assert.equal((html.match(/<picture><source media="\(prefers-reduced-motion: no-preference\)" srcset="\/images\/app\/motion\/[a-z-]+\.webp" type="image\/webp" \/><img [^>]+\/><\/picture>/g) ?? []).length, loops);
  assert.doesNotMatch(html, /data-motion/);
});

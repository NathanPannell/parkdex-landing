import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("the homepage pitches solo walkers, not the retired crews", () => {
  assert.doesNotMatch(page, /crew/i);
  assert.match(page, /data-step="walk"/);
});

test("every app screen on the homepage exists in public/", () => {
  const paths = [...page.matchAll(/(?:src|data-motion)="(\/images\/app\/[^"]+)"/g)].map((match) => match[1]);
  assert.ok(paths.length > 0);
  for (const path of paths) assert.ok(existsSync(new URL(`../public${path}`, import.meta.url)), path);
});

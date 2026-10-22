import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../index.html", import.meta.url), "utf8");
const script = await readFile(new URL("../src/main.ts", import.meta.url), "utf8");

test("Android beta buttons open the self-service steps, not an email form", () => {
  assert.doesNotMatch(page, /data-signup-open="android_beta"/);
  assert.doesNotMatch(page, /value="android_beta"/);
  assert.doesNotMatch(script, /android_beta/);
  assert.ok((page.match(/data-beta-open/g) ?? []).length >= 3);
  assert.match(page, /<dialog id="beta-access"/);
});

test("both copies of the steps link to the tester group, then the Play testing page", () => {
  const lists = [...page.matchAll(/<ol class="beta-steps" data-beta-steps>([\s\S]*?)<\/ol>/g)].map((match) => match[1]);
  assert.equal(lists.length, 2);
  for (const list of lists) {
    const links = [...list.matchAll(/<a class="beta-step-button" href="([^"]+)" target="_blank" rel="noopener" data-beta-link="(\d)"/g)];
    assert.deepEqual(
      links.map((link) => [link[1], link[2]]),
      [
        ["https://groups.google.com/g/parkdex-testers/about", "1"],
        ["https://play.google.com/apps/testing/app.parkdex", "2"],
      ],
    );
    assert.match(list, /1<\/span>\s*<span class="beta-step-label">Join the tester group/);
    assert.match(list, /2<\/span>\s*<span class="beta-step-label">Install Parkdex/);
  }
});

test("the App Store waitlist still posts only to its own list", () => {
  assert.match(script, /const list = ["']app_store["'];/);
  assert.match(page, /data-signup-open="app_store"/);
});

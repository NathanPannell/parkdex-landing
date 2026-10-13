import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { KIP_APP_ORIGINS } from "../src/app-origins.ts";
import { rewriteStaticAppLinks } from "../src/site-metadata.ts";

test("production and staging Vercel configs route nothing to the retired legacy app or API", () => {
  for (const file of ["vercel.json", "vercel.staging.json"]) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    const config = JSON.parse(source);
    assert.equal(config.rewrites, undefined, file);
    assert.equal(config.redirects, undefined, file);
    assert.doesNotMatch(source, /railway\.app|map\.parkdex\.app|\/mcp|well-known/, file);
  }
});

test("static app links and migration handoffs use the matching Kip app host", () => {
  assert.deepEqual(KIP_APP_ORIGINS, {
    production: "https://web.parkdex.app",
    staging: "https://staging.web.parkdex.app",
  });
  const source = `<a href="${KIP_APP_ORIGINS.production}/migrate/">Move guest progress</a>`;
  assert.equal(rewriteStaticAppLinks(source, KIP_APP_ORIGINS.production), source);
  assert.equal(
    rewriteStaticAppLinks(source, KIP_APP_ORIGINS.staging),
    `<a href="${KIP_APP_ORIGINS.staging}/migrate/">Move guest progress</a>`,
  );
  assert.throws(() => rewriteStaticAppLinks(source, "https://attacker.example"), /Unsupported VITE_APP_URL/);
});

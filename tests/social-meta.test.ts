import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createRobotsTxt, createSitemapXml, rewriteStaticAppLinks } from "../src/mcp-metadata.ts";

const page = await readFile(new URL("../index.html", import.meta.url), "utf8");

function meta(attribute: "name" | "property", key: string): string | undefined {
  return page.match(new RegExp(`<meta ${attribute}="${key}" content="([^"]*)"`))?.[1];
}

test("landing page carries complete share metadata with an absolute image", () => {
  assert.match(page, /<link rel="canonical" href="https:\/\/parkdex.app\/" \/>/);
  for (const key of ["og:title", "og:description", "og:url", "og:image", "og:image:alt", "og:site_name"]) {
    assert.ok(meta("property", key), key);
  }
  for (const key of ["twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
    assert.ok(meta("name", key), key);
  }
  assert.equal(meta("property", "og:image"), "https://parkdex.app/og-image.jpg");
  assert.equal(meta("property", "og:image:width"), "1200");
  assert.equal(meta("property", "og:image:height"), "630");
  assert.equal(meta("name", "twitter:card"), "summary_large_image");
  assert.ok((meta("name", "description") ?? "").length <= 160);
});

test("structured data is valid JSON", () => {
  const block = page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(block);
  const data = JSON.parse(block);
  assert.equal(data["@context"], "https://schema.org");
  assert.deepEqual(data["@graph"].map((node: { "@type": string }) => node["@type"]), ["WebSite", "MobileApplication"]);
});

test("canonical and share URLs follow the staging landing host", () => {
  const source = '<link rel="canonical" href="https://parkdex.app/" /><meta property="og:image" content="https://parkdex.app/og-image.jpg" />';
  assert.equal(rewriteStaticAppLinks(source, "https://web.parkdex.app"), source);
  assert.equal(
    rewriteStaticAppLinks(source, "https://staging.web.parkdex.app"),
    '<link rel="canonical" href="https://staging.parkdex.app/" /><meta property="og:image" content="https://staging.parkdex.app/og-image.jpg" />',
  );
});

test("only production is crawlable and lists its sitemap", () => {
  assert.match(createRobotsTxt("https://web.parkdex.app"), /Allow: \/\n[\s\S]*Sitemap: https:\/\/parkdex.app\/sitemap.xml/);
  assert.equal(createRobotsTxt("https://staging.web.parkdex.app"), "User-agent: *\nDisallow: /\n");
  const sitemap = createSitemapXml("https://web.parkdex.app");
  assert.match(sitemap, /<loc>https:\/\/parkdex.app\/<\/loc>/);
  assert.doesNotMatch(sitemap, /mockups/);
});

test("policy pages carry canonical and share tags for their own URL", async () => {
  for (const path of ["privacy", "support", "delete-account"]) {
    const html = await readFile(new URL(`../${path}/index.html`, import.meta.url), "utf8");
    assert.match(html, new RegExp(`<link rel="canonical" href="https://parkdex.app/${path}/" />`), path);
    assert.match(html, new RegExp(`<meta property="og:url" content="https://parkdex.app/${path}/" />`), path);
    assert.match(html, /<meta property="og:image" content="https:\/\/parkdex.app\/og-image.jpg" \/>/, path);
    assert.match(html, /<meta name="twitter:card" content="summary_large_image" \/>/, path);
  }
});

test("meta content uses typographic apostrophes so naive scrapers do not truncate it", async () => {
  for (const path of ["../index.html", "../privacy/index.html", "../support/index.html", "../delete-account/index.html"]) {
    const html = await readFile(new URL(path, import.meta.url), "utf8");
    for (const [, content] of html.matchAll(/<meta [^>]*content="([^"]*)"/g)) {
      assert.doesNotMatch(content, /'/, `${path}: ${content}`);
    }
  }
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const schema = await readFile(new URL("../schema.sql", import.meta.url), "utf8");

test("schema is one statement so the preview script and Neon HTTP driver can run it", () => {
  const outsideBlocks = schema.replace(/\$\$[\s\S]*?\$\$/g, "").replace(/--.*$/gm, "");
  assert.equal(outsideBlocks.split(";").filter((part) => part.trim()).length, 1);
});

test("schema creates both signup lists and keeps the legacy list", () => {
  for (const table of ["waitlist_signups", "android_beta_signups", "app_store_waitlist_signups"]) {
    assert.match(schema, new RegExp(`CREATE TABLE IF NOT EXISTS ${table} \(`));
  }
  assert.doesNotMatch(schema, /\b(DROP|TRUNCATE|DELETE|INSERT)\b/i);
});

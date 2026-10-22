import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const schema = await readFile(new URL("../schema.sql", import.meta.url), "utf8");

test("schema is one statement so the preview script and Neon HTTP driver can run it", () => {
  const outsideBlocks = schema.replace(/\$\$[\s\S]*?\$\$/g, "").replace(/--.*$/gm, "");
  assert.equal(outsideBlocks.split(";").filter((part) => part.trim()).length, 1);
});

test("schema creates both signup lists and retires the legacy list", () => {
  for (const table of ["android_beta_signups", "app_store_waitlist_signups"]) {
    assert.match(schema, new RegExp(`CREATE TABLE IF NOT EXISTS ${table} [(]`));
  }
  assert.doesNotMatch(schema, /CREATE TABLE IF NOT EXISTS waitlist_signups/);
  assert.match(schema, /IF to_regclass\('public\.waitlist_signups'\) IS NOT NULL THEN/);
  assert.match(
    schema,
    /INSERT INTO app_store_waitlist_signups[\s\S]*ON CONFLICT \(email_normalized\) DO NOTHING;\s*DROP TABLE waitlist_signups;/,
  );
  assert.doesNotMatch(schema, /\b(TRUNCATE|DELETE)\b/i);
});

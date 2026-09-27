import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// Normalize line endings so Windows checkouts and CI read the same text.
const read = async (path: string) => (await readFile(new URL(path, import.meta.url), "utf8")).replace(/\r\n/g, "\n");
const release = await read("../.github/workflows/deploy-release.yml");
const staging = await read("../.github/workflows/deploy-staging.yml");
const production = await read("../.github/workflows/deploy-production.yml");
const preview = await read("../scripts/preview-pr.mjs");

test("both environments deploy to the single parkdex-landing Vercel project", () => {
  assert.match(release, /VERCEL_PROJECT_ID: \$\{\{ vars\.VERCEL_PROJECT_ID \}\}/);
  assert.match(release, /project_name=parkdex-landing\n/);
  assert.doesNotMatch(release + staging + production + preview, /VERCEL_(STAGING|PRODUCTION)_PROJECT_ID|parkdex-landing-staging/);
});

test("staging is a Preview-target deployment with a deployment-scoped database URL", () => {
  assert.match(release, /target_args=\(--target preview --local-config vercel\.staging\.json --env "DATABASE_URL=\$STAGING_DATABASE_URL"\)/);
  assert.match(release, /target_args=\(--prod\)/);
  assert.match(staging, /STAGING_DATABASE_URL: \$\{\{ secrets\.STAGING_DATABASE_URL \}\}/);
  assert.doesNotMatch(production, /STAGING_DATABASE_URL/);
});

test("release workflows run only on exact protected branch pushes", () => {
  assert.match(staging, /on:\n  push:\n    branches: \[staging\]\n/);
  assert.match(production, /on:\n  push:\n    branches: \[main\]\n/);
  assert.match(release, /on:\n  workflow_call:/);
  for (const workflow of [release, staging, production]) {
    assert.doesNotMatch(workflow, /pull_request|workflow_dispatch|schedule:|workflow_run/);
  }
});

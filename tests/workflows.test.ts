import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
const preview = readFileSync(new URL("../scripts/preview-pr.mjs", import.meta.url), "utf8");
const staging = [{ type: "host", value: "staging.parkdex.app" }];

test("Vercel Git deploys only main and staging, with no Actions deploy", () => {
  assert.deepEqual(config.git.deploymentEnabled, { "**": false, main: true, staging: true });
  for (const name of ["deploy-release", "deploy-staging", "deploy-production"]) {
    assert.equal(existsSync(new URL(`../.github/workflows/${name}.yml`, import.meta.url)), false);
  }
});

test("staging.parkdex.app is marked noindex", () => {
  assert.ok(
    config.headers.some(
      (route: { has?: unknown; headers: { key: string; value: string }[] }) =>
        JSON.stringify(route.has) === JSON.stringify(staging) &&
        route.headers.some((header) => header.key === "X-Robots-Tag" && header.value === "noindex"),
    ),
  );
});

test("PR previews still deploy to the single parkdex-landing project", () => {
  assert.doesNotMatch(preview, /VERCEL_(STAGING|PRODUCTION)_PROJECT_ID|parkdex-landing-staging/);
});

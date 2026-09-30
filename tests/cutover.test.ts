import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { KIP_APP_ORIGINS, LEGACY_APP_ORIGIN_BY_LANDING_ORIGIN } from "../src/app-origins.ts";
import { authTokenRedirectTarget } from "../src/auth-token-redirect.ts";
import { createMcpMetadata, rewriteStaticAppLinks } from "../src/mcp-metadata.ts";

test("production and staging Vercel configs preserve the seven legacy API routes", () => {
  const expectedRoutes = [
    "/mcp",
    "/mcp/:path*",
    "/authorize",
    "/token",
    "/register",
    "/revoke",
    "/oauth/consent",
  ].sort();

  for (const [file, apiOrigin, appOrigin] of [
    ["vercel.json", "https://api-production-e72df.up.railway.app", "https://map.parkdex.app"],
    ["vercel.staging.json", "https://api-staging-882c.up.railway.app", "https://staging.map.parkdex.app"],
  ] as const) {
    const config = JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), "utf8"));
    // vercel.json also carries host-scoped staging routes; those are checked in workflows.test.ts.
    config.rewrites = config.rewrites.filter((route: { has?: unknown }) => !route.has);
    config.redirects = config.redirects.filter((route: { has?: unknown }) => !route.has);
    assert.deepEqual(config.rewrites.map((route: { source: string }) => route.source).sort(), expectedRoutes);
    assert.ok(config.rewrites.every((route: { destination: string }) => route.destination.startsWith(`${apiOrigin}/`)));
    const metadataHeaders = config.headers.filter((route: { source: string }) => route.source.startsWith("/.well-known/"));
    assert.equal(metadataHeaders.length, 2);
    for (const route of metadataHeaders) {
      assert.ok(route.headers.some((header: { key: string; value: string }) => header.key === "Access-Control-Allow-Origin" && header.value === "*"));
      assert.ok(route.headers.some((header: { key: string; value: string }) => header.key === "Cache-Control" && header.value === "no-store"));
      assert.ok(route.headers.some((header: { key: string; value: string }) => header.key === "Content-Type" && header.value === "application/json"));
    }
    assert.equal(config.redirects.length, 1);
    assert.deepEqual(config.redirects[0], {
      source: "/auth/google/callback",
      destination: `${appOrigin}/auth/google/callback`,
      permanent: false,
    });
  }
});

test("generated MCP metadata matches the current production and staging issuers", () => {
  assert.deepEqual(createMcpMetadata("https://web.parkdex.app"), {
    authorizationServer: {
      issuer: "https://parkdex.app/",
      authorization_endpoint: "https://parkdex.app/authorize",
      token_endpoint: "https://parkdex.app/token",
      registration_endpoint: "https://parkdex.app/register",
      revocation_endpoint: "https://parkdex.app/revoke",
      scopes_supported: ["mcp"],
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      token_endpoint_auth_methods_supported: ["none"],
      revocation_endpoint_auth_methods_supported: ["none"],
      code_challenge_methods_supported: ["S256"],
    },
    protectedResource: {
      resource: "https://parkdex.app/mcp",
      authorization_servers: ["https://parkdex.app/"],
      scopes_supported: ["mcp"],
      bearer_methods_supported: ["header"],
    },
  });
  assert.deepEqual(createMcpMetadata("https://staging.web.parkdex.app"), {
    authorizationServer: {
      issuer: "https://staging.parkdex.app/",
      authorization_endpoint: "https://staging.parkdex.app/authorize",
      token_endpoint: "https://staging.parkdex.app/token",
      registration_endpoint: "https://staging.parkdex.app/register",
      revocation_endpoint: "https://staging.parkdex.app/revoke",
      scopes_supported: ["mcp"],
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      token_endpoint_auth_methods_supported: ["none"],
      revocation_endpoint_auth_methods_supported: ["none"],
      code_challenge_methods_supported: ["S256"],
    },
    protectedResource: {
      resource: "https://staging.parkdex.app/mcp",
      authorization_servers: ["https://staging.parkdex.app/"],
      scopes_supported: ["mcp"],
      bearer_methods_supported: ["header"],
    },
  });
  assert.throws(() => createMcpMetadata("https://attacker.example"), /Unsupported VITE_APP_URL/);
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

test("only exact reset and verification fragments move to the matching legacy app host", () => {
  assert.deepEqual(LEGACY_APP_ORIGIN_BY_LANDING_ORIGIN, {
    "https://parkdex.app": "https://map.parkdex.app",
    "https://staging.parkdex.app": "https://staging.map.parkdex.app",
  });
  assert.equal(
    authTokenRedirectTarget("https://parkdex.app", "#resetToken=reset-123"),
    "https://map.parkdex.app/#resetToken=reset-123",
  );
  assert.equal(
    authTokenRedirectTarget("https://parkdex.app", "#verificationToken=verify-456"),
    "https://map.parkdex.app/#verificationToken=verify-456",
  );
  assert.equal(
    authTokenRedirectTarget("https://staging.parkdex.app", "#verificationToken=verify-456"),
    "https://staging.map.parkdex.app/#verificationToken=verify-456",
  );
  assert.equal(
    authTokenRedirectTarget("https://staging.parkdex.app", "#resetToken=reset-123"),
    "https://staging.map.parkdex.app/#resetToken=reset-123",
  );

  for (const [origin, hash] of [
    ["https://parkdex.app", "#otherToken=secret"],
    ["https://parkdex.app", "#resetToken="],
    ["https://parkdex.app", "#resetToken=one&tracking=two"],
    ["https://parkdex.app", "#resetToken=one&verificationToken=two"],
    ["https://parkdex.app", "#resetToken=one&resetToken=two"],
    ["https://staging.parkdex.app", "#verificationToken=one&unrecognized=value"],
    ["https://www.parkdex.app", "#resetToken=secret"],
    ["https://web.parkdex.app", "#resetToken=secret"],
    ["https://staging.web.parkdex.app", "#verificationToken=secret"],
  ]) {
    assert.equal(authTokenRedirectTarget(origin, hash), null, `${origin}${hash}`);
  }
});

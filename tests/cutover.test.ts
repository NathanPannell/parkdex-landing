import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { authTokenRedirectTarget } from "../src/auth-token-redirect.ts";
import {
  GUEST_PROGRESS_KEYS,
  MAX_GUEST_TRANSFER_BYTES,
  connectGuestMigration,
  createGuestMigrationTransfer,
  isGuestMigrationReady,
  type GuestMigrationEvent,
  type GuestMigrationPopup,
  type GuestMigrationRuntime,
  type GuestMigrationTransfer,
  type GuestProgressKey,
} from "../src/guest-migration.ts";
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
    ["vercel.json", "https://api-production-e72df.up.railway.app", "https://web.parkdex.app"],
    ["vercel.staging.json", "https://api-staging-882c.up.railway.app", "https://staging.web.parkdex.app"],
  ] as const) {
    const config = JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), "utf8"));
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
    assert.equal(config.git.deploymentEnabled, false);
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

test("static app links use only the matching production or staging app host", () => {
  const source = '<a href="https://web.parkdex.app">Open Parkdex</a>';
  assert.equal(rewriteStaticAppLinks(source, "https://web.parkdex.app"), source);
  assert.equal(
    rewriteStaticAppLinks(source, "https://staging.web.parkdex.app"),
    '<a href="https://staging.web.parkdex.app">Open Parkdex</a>',
  );
  assert.throws(() => rewriteStaticAppLinks(source, "https://attacker.example"), /Unsupported VITE_APP_URL/);
});

test("only exact reset and verification fragments move to the matching web app", () => {
  assert.equal(
    authTokenRedirectTarget("https://parkdex.app", "#resetToken=reset-123"),
    "https://web.parkdex.app/#resetToken=reset-123",
  );
  assert.equal(
    authTokenRedirectTarget("https://staging.parkdex.app", "#verificationToken=verify-456"),
    "https://staging.web.parkdex.app/#verificationToken=verify-456",
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
  ]) {
    assert.equal(authTokenRedirectTarget(origin, hash), null, `${origin}${hash}`);
  }
});

test("guest migration opens only on action and sends only allowlisted data to the exact app window", () => {
  const values = new Map<string, string>([
    ["every-park:collection-key:v1", "guest-collection"],
    ["every-park:visited:v1", "guest-visits"],
    ["every-park:account-token:v1", "account-secret"],
    ["every-park:account-snapshot:v1", "account-snapshot"],
  ]);
  const reads: string[] = [];
  const removals: string[] = [];
  const storage = {
    getItem(key: string) {
      reads.push(key);
      return values.get(key) ?? null;
    },
    removeItem(key: string) {
      removals.push(key);
      values.delete(key);
    },
  };
  let clickListener: (() => void) | undefined;
  const button = {
    disabled: false,
    addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
      assert.equal(type, "click");
      clickListener = listener as () => void;
    },
    click() { clickListener?.(); },
  };
  const panel = { hidden: true };
  const status = { textContent: "" };
  const posted: Array<{ message: GuestMigrationTransfer; targetOrigin: string }> = [];
  const popup: GuestMigrationPopup = {
    postMessage(message, targetOrigin) { posted.push({ message, targetOrigin }); },
  };
  let openedUrl: string | undefined;
  let openedTarget: "_blank" | undefined;
  let listener: ((event: GuestMigrationEvent) => void) | undefined;
  let unsubscribed = false;
  const runtime: GuestMigrationRuntime = {
    landingOrigin: "https://parkdex.app",
    getStorage: () => storage,
    open(url, target) {
      openedUrl = url;
      openedTarget = target;
      return popup;
    },
    subscribe(nextListener) {
      listener = nextListener;
      return () => { unsubscribed = true; };
    },
  };

  connectGuestMigration(
    panel as unknown as HTMLElement,
    button as unknown as HTMLButtonElement,
    status as unknown as HTMLElement,
    runtime,
  );

  assert.equal(panel.hidden, false);
  assert.equal(openedUrl, undefined, "the new app must not open before explicit action");
  assert.ok(reads.every((key) => (GUEST_PROGRESS_KEYS as readonly string[]).includes(key)));
  button.click();

  assert.equal(openedUrl, "https://web.parkdex.app/migrate/");
  assert.equal(openedTarget, "_blank");
  assert.equal(button.disabled, true);
  assert.equal(posted.length, 0);
  assert.ok(listener);

  listener!({ origin: "https://web.parkdex.app", source: {}, data: { type: "parkdex-guest-migration-ready", version: 1 } });
  listener!({ origin: "https://attacker.example", source: popup, data: { type: "parkdex-guest-migration-ready", version: 1 } });
  assert.equal(posted.length, 0, "wrong origin or source must not start transfer");

  listener!({ origin: "https://web.parkdex.app", source: popup, data: { type: "parkdex-guest-migration-ready", version: 1 } });
  listener!({ origin: "https://web.parkdex.app", source: popup, data: { type: "parkdex-guest-migration-ready", version: 1 } });
  assert.equal(posted.length, 1, "the allowlisted payload is sent only once");
  assert.equal(posted[0].targetOrigin, "https://web.parkdex.app");
  assert.deepEqual(posted[0].message.values, {
    "every-park:collection-key:v1": "guest-collection",
    "every-park:visited:v1": "guest-visits",
  });
  assert.equal("every-park:account-token:v1" in posted[0].message.values, false);
  assert.equal("every-park:account-snapshot:v1" in posted[0].message.values, false);

  values.set("every-park:visited:v1", "newer-local-change");
  const imported = { type: "parkdex-guest-migration-result", version: 1, status: "imported" };
  listener!({ origin: "https://web.parkdex.app", source: {}, data: imported });
  assert.deepEqual(removals, [], "an ack from another window must not clear local data");
  listener!({ origin: "https://attacker.example", source: popup, data: imported });
  assert.deepEqual(removals, [], "an ack from another origin must not clear local data");
  listener!({ origin: "https://web.parkdex.app", source: popup, data: imported });

  assert.equal(unsubscribed, true);
  assert.deepEqual(removals, ["every-park:collection-key:v1"]);
  assert.equal(values.get("every-park:visited:v1"), "newer-local-change");
  assert.equal(values.get("every-park:account-token:v1"), "account-secret");
  assert.equal(values.get("every-park:account-snapshot:v1"), "account-snapshot");
  assert.equal(status.textContent, "The saved progress was moved. Newer changes on this page remain here.");
});

test("guest transfer filters unknown keys and rejects payloads over 256 KiB", () => {
  const extraKeyValues = {
    "every-park:visited:v1": "visited",
    "every-park:account-token:v1": "must-not-be-included",
    ["other-secret" as GuestProgressKey]: "must-not-be-included-either",
  };
  const transfer = createGuestMigrationTransfer(extraKeyValues);
  assert.deepEqual(transfer?.values, { "every-park:visited:v1": "visited" });
  assert.ok(new TextEncoder().encode(JSON.stringify(transfer)).byteLength <= MAX_GUEST_TRANSFER_BYTES);
  assert.equal(createGuestMigrationTransfer({ "every-park:visited:v1": "x".repeat(MAX_GUEST_TRANSFER_BYTES) }), null);

  assert.equal(isGuestMigrationReady({ type: "parkdex-guest-migration-ready", version: 1 }), true);
  assert.equal(isGuestMigrationReady({ type: "parkdex-guest-migration-ready", version: 1, extra: true }), false);
});

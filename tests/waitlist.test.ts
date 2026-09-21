import assert from "node:assert/strict";
import test from "node:test";
import { createWaitlistHandler, normalizeEmail } from "../lib/waitlist.ts";

const ENDPOINT = "https://parkdex-landing.vercel.app/api/waitlist";

function signup(body: unknown, origin = "https://parkdex-landing.vercel.app", headers: Record<string, string> = {}): Request {
  return new Request(ENDPOINT, {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

test("normalizes ordinary emails and rejects malformed addresses", () => {
  assert.equal(normalizeEmail("  NAME+Tag@Example.COM "), "name+tag@example.com");
  for (const email of ["", "a@b", "a..b@example.com", "a@-example.com", "a@example..com", "a@example.c", "a b@example.com", "x".repeat(65) + "@example.com"]) {
    assert.equal(normalizeEmail(email), null, email);
  }
});

test("registers once and returns generic success for duplicate submissions", async () => {
  const saved = new Set<string>();
  let calls = 0;
  const handle = createWaitlistHandler({ async saveSignup(email) { calls++; saved.add(email); } });
  const first = await handle(signup({ email: " NAME@example.com " }));
  const second = await handle(signup({ email: "name@example.com" }));
  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), { ok: true });
  assert.deepEqual(await second.json(), { ok: true });
  assert.equal(calls, 2);
  assert.deepEqual([...saved], ["name@example.com"]);
  assert.equal(first.headers.get("Cache-Control"), "no-store");
});

test("honeypot returns success without storing", async () => {
  let calls = 0;
  const handle = createWaitlistHandler({ async saveSignup() { calls++; } });
  const response = await handle(signup({ email: "bot@example.com", company: "spam" }));
  assert.equal(response.status, 200);
  assert.equal(calls, 0);
});

test("rejects cross-origin, missing origin, wrong method, invalid content and oversized body", async () => {
  let calls = 0;
  const handle = createWaitlistHandler({ async saveSignup() { calls++; } });
  assert.equal((await handle(signup({ email: "a@example.com" }, "https://evil.example"))).status, 403);
  assert.equal((await handle(new Request(ENDPOINT, { method: "POST", body: "{}", headers: { "Content-Type": "application/json" } }))).status, 403);
  assert.equal((await handle(new Request(ENDPOINT, { method: "GET" }))).status, 405);
  assert.equal((await handle(new Request(ENDPOINT, { method: "POST", body: "email=a@example.com", headers: { Origin: new URL(ENDPOINT).origin, "Content-Type": "application/x-www-form-urlencoded" } }))).status, 415);
  assert.equal((await handle(signup({ email: "a@example.com", padding: "x".repeat(2048) }))).status, 400);
  assert.equal((await handle(signup({ email: "bad" }))).status, 400);
  assert.equal(calls, 0);
});

test("database failure does not expose details or claim a signup", async () => {
  const handle = createWaitlistHandler({ async saveSignup() { throw new Error("secret database detail"); } });
  const response = await handle(signup({ email: "a@example.com" }));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false, error: "unavailable" });
});

test("configured future canonical origin is accepted", async () => {
  let saved = "";
  const handle = createWaitlistHandler({ canonicalOrigin: "https://parkdex.app", async saveSignup(email) { saved = email; } });
  const response = await handle(signup({ email: "a@example.com" }, "https://parkdex.app"));
  assert.equal(response.status, 200);
  assert.equal(saved, "a@example.com");
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const privacyPage = await readFile(new URL("../privacy/index.html", import.meta.url), "utf8");

test("privacy policy covers the public Android app and describes its photo storage", () => {
  assert.match(
    privacyPage,
    /This policy covers the Parkdex web app, the public Parkdex Android app, and this landing page\./,
  );
  assert.match(
    privacyPage,
    /The Parkdex Android app stores visit photos privately with Cloudflare R2 through the Parkdex API\./,
  );
  assert.doesNotMatch(privacyPage, /the test version being prepared for Android|The Android test version/i);
});

test("privacy policy describes the App Store list and the Google-run Android beta", () => {
  assert.match(privacyPage, /The landing page keeps two separate lists\./);
  assert.match(privacyPage, /Joining the App Store waitlist saves your email address and signup time to send one email when Parkdex reaches the App Store\./);
  assert.match(privacyPage, /The earlier Android beta list is closed to new signups/);
  assert.match(privacyPage, /Parkdex Testers Google Group/);
  assert.match(privacyPage, /deletes the address from both lists/);
});

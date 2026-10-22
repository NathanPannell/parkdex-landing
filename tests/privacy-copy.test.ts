import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const privacyPage = await readFile(new URL("../privacy/index.html", import.meta.url), "utf8");

test("privacy policy covers the public Android app and describes its photo storage", () => {
  assert.match(privacyPage, /This policy covers the Parkdex web app, the public Parkdex Android app, and this landing page\./);
  assert.match(privacyPage, /Visit photos saved before October 22, 2026 are stored privately with Cloudflare R2 through the Parkdex API\./);
  assert.doesNotMatch(privacyPage, /the test version being prepared for Android|The Android test version/i);
});

test("privacy policy describes crews and visit photos as retired, not as live features", () => {
  assert.match(privacyPage, /Parkdex no longer has crews\./);
  assert.match(privacyPage, /The only photo you take in Parkdex is the founding photo of a park\./);
  assert.match(privacyPage, /Parkdex no longer takes visit photos/);
  assert.doesNotMatch(
    privacyPage,
    /When you join a crew|crewmates you add|When you save a visit photo|postcard|claim a park|a screenshot if you attach one/,
  );
});

test("privacy policy describes the App Store list and the Google-run Android beta", () => {
  assert.match(privacyPage, /The landing page keeps two separate lists\./);
  assert.match(
    privacyPage,
    /Joining the App Store waitlist saves your email address and signup time to send one email when Parkdex reaches the App Store\./,
  );
  assert.match(privacyPage, /The earlier Android beta list is closed to new signups/);
  assert.match(privacyPage, /Parkdex Testers Google Group/);
  assert.match(privacyPage, /deletes the address from both lists/);
});

test("privacy policy matches the app 1.5.0 data practices declared on Google Play", () => {
  assert.doesNotMatch(privacyPage, /does not include advertising or marketing analytics SDKs/);
  assert.doesNotMatch(privacyPage, /OpenFreeMap/);
  assert.doesNotMatch(privacyPage, /A verified visit stores that location evidence/);
  assert.match(privacyPage, /Parkdex uses PostHog for product analytics/);
  assert.match(privacyPage, /can use it to estimate your approximate location/);
  assert.match(privacyPage, /These records are kept in the Parkdex database for 90 days\./);
  assert.match(privacyPage, /Anyone can see them on the leaderboard and the park map, including people who are not signed in\./);
  assert.match(privacyPage, /Logging a visit sends the park you are visiting, not your coordinates\./);
  assert.match(privacyPage, /Nominatim service and public Overpass API servers/);
  assert.match(privacyPage, /keeps the photo, your position and the park outline for 24 hours/);
  assert.match(privacyPage, /Parkdex uses OpenRouter to run automated content checks/);
  assert.match(privacyPage, /Feedback is not linked to your account, so deleting your account does not remove it\./);
  assert.match(privacyPage, /Analytics already sent to PostHog is not deleted\./);
});

test("privacy policy does not overstate backup exclusions or guest deletion", () => {
  assert.doesNotMatch(privacyPage, /installation identifier[^.]*excluded/);
  assert.match(privacyPage, /Your sign-in session and the downloaded park content are excluded\./);
  assert.match(privacyPage, /Uninstalling the app does not end the session by itself\./);
});

test("delete-account page lists what stays after deletion, like the privacy policy", async () => {
  const deletePage = await readFile(new URL("../delete-account/index.html", import.meta.url), "utf8");
  assert.match(deletePage, /analytics already sent to PostHog and feedback you sent are not deleted/);
  assert.match(deletePage, /Parks you founded stay on the map without your name or cover photo\./);
  assert.match(deletePage, /any crew memberships or visit photos from before October 22, 2026/);
});

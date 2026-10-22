import { expect, test, type Page } from "@playwright/test";

const parkId = "municipal-city-of-colwood-1863";

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

test("homepage renders the hero and its calls to action", async ({ page }) => {
  const errors = trackErrors(page);
  await page.route("/api/flags", (route) => route.fulfill({ status: 502, json: { error: "unavailable" } }));
  await page.goto("/");
  await expect(page).toHaveTitle(/Parkdex/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-beta-open]").first()).toBeVisible();
  await expect(page.locator("[data-signup-open]").first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  // The stubbed 502 is the only expected console error.
  expect(errors.filter((error) => !error.includes("502"))).toEqual([]);
});

test("App Store waitlist signup posts the address and confirms it", async ({ page }) => {
  let body: unknown;
  await page.route("/api/waitlist", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ status: 200, json: { ok: true } });
  });
  await page.goto("/");
  await page.locator("[data-signup-open]").first().click();
  const dialog = page.locator("#signup-dialog");
  await expect(dialog).toBeVisible();
  await dialog.locator("#signup-email").fill("  Walker@Example.com ");
  await dialog.locator("#signup-submit").click();
  await expect(dialog.locator("#signup-message")).toContainText("Walker@Example.com is on the App Store waitlist");
  await expect(dialog.locator("#signup-submit")).toBeDisabled();
  expect(body).toEqual({ email: "Walker@Example.com", list: "app_store", company: "" });
});

test("waitlist signup rejects an invalid address without a request", async ({ page }) => {
  let requests = 0;
  await page.route("/api/waitlist", (route) => {
    requests += 1;
    return route.fulfill({ status: 200, json: { ok: true } });
  });
  await page.goto("/");
  await page.locator("[data-signup-open]").first().click();
  await page.locator("#signup-email").fill("not-an-email");
  await page.locator("#signup-submit").click();
  await expect(page.locator("#signup-message")).toContainText("Add a valid email address");
  expect(requests).toBe(0);
});

test("waitlist shows a retry message when the server rate-limits", async ({ page }) => {
  await page.route("/api/waitlist", (route) => route.fulfill({ status: 429, json: { ok: false } }));
  await page.goto("/");
  await page.locator("[data-signup-open]").first().click();
  await page.locator("#signup-email").fill("walker@example.com");
  await page.locator("#signup-submit").click();
  await expect(page.locator("#signup-message")).toContainText("A few too many tries");
});

test("About your email removes an address from both lists", async ({ page }) => {
  let body: unknown;
  await page.route("/api/waitlist", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ status: 200, json: { ok: true } });
  });
  await page.goto("/#email-privacy");
  const dialog = page.locator("#email-privacy");
  await expect(dialog).toBeVisible();
  await dialog.locator("#remove-email").fill("walker@example.com");
  await dialog.locator("#remove-button").click();
  await expect(dialog.locator("#remove-message")).toContainText("it has been removed");
  expect(body).toEqual({ email: "walker@example.com", action: "remove", company: "" });
});

test("Android beta dialog walks through the two steps", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-beta-open]").first().click();
  const dialog = page.locator("#beta-access");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("[data-beta-step]")).toHaveCount(2);
  await expect(dialog.locator('[data-state="current"]')).toHaveCount(1);
});

test("live flags are planted on the homepage park map", async ({ page }) => {
  const now = new Date().toISOString();
  await page.route("/api/flags", (route) =>
    route.fulfill({ status: 200, json: { flags: [{ parkId, flagSeed: "e2e-seed", since: now }], serverTime: now } }),
  );
  await page.goto("/");
  const map = page.locator(".parks__map .dots");
  await map.scrollIntoViewIfNeeded();
  await expect(map.locator(".dots__flag")).toHaveCount(1);
  await expect(map).toHaveAttribute("aria-label", /with 1 flag flying now/);
});

for (const [path, heading] of [
  ["/privacy/", "Privacy for Parkdex."],
  ["/support/", "Parkdex support."],
  ["/delete-account/", "Delete your Parkdex account."],
  ["/near-me/", "Park map"],
] as const) {
  test(`${path} renders`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
  });
}

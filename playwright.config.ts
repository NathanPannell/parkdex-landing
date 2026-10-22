import { defineConfig, devices } from "@playwright/test";

// E2E runs against the production build served by `vite preview`. Vercel Functions
// (/api/*) are not served there, so the specs stub them at the network layer.
export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4317",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run preview",
    url: "http://127.0.0.1:4317",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});

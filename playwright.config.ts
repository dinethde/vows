import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end specs for the album page (DESIGN.md §12.9).
 *
 * Three projects, one per breakpoint, so the responsive rules are checked
 * rather than assumed. `npm run test:e2e` starts the dev server itself.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1024 } },
    },
    {
      name: "tablet",
      use: { ...devices["Desktop Chrome"], viewport: { width: 834, height: 1194 } },
    },
    {
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    // Locally this attaches to the dev server already running; in CI there
    // is nothing legitimate on :3000, so attaching to whatever answers would
    // test an unknown build.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

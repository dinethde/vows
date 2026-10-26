import { expect, test } from "@playwright/test";

/**
 * The Studio's gate needs a real Clerk instance. Without keys, `next dev` runs
 * Clerk in keyless mode and lets a first visit through, so these only run
 * against a deployed address.
 */
const deployed = Boolean(process.env.E2E_BASE_URL);

test.describe("the Studio, to someone who is not signed in", () => {
  test.skip(!deployed, "Needs a deployed site with Clerk keys.");

  test("answers 403, says the page is private, and offers the way in", async ({ page }) => {
    const response = await page.goto("/studio/albums/alb_000001");
    expect(response?.status()).toBe(403);
    expect(response?.headers()["x-robots-tag"]).toContain("noindex");
    expect(response?.headers()["cache-control"]).toContain("no-store");

    await expect(
      page.getByRole("heading", { level: 1, name: "This album is private." }),
    ).toBeVisible();
    const signIn = page.getByRole("link", { name: "Sign in to the Studio" });
    await expect(signIn).toHaveAttribute(
      "href",
      "/studio/sign-in?redirect_url=%2Fstudio%2Falbums%2Falb_000001",
    );
  });

  test("never serves the dashboard’s data", async ({ page }) => {
    const response = await page.goto("/studio");
    expect(response?.status()).toBe(403);
    await expect(page.getByRole("link", { name: /Benali/ })).toHaveCount(0);
  });
});

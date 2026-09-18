import { expect, test, type Page } from "@playwright/test";

/**
 * The site with site data blocked.
 *
 * `sessionStorage` and `localStorage` do not return null when a browser
 * refuses storage — reading them throws `SecurityError` outright. That happens
 * with Chrome's "Don't allow sites to save data", Safari's Lockdown Mode, some
 * embedded webviews and partitioned third-party contexts. Three features
 * remember something across a visit (the canvas position, the loader's
 * "already seen" mark, the player's pause), and none of them is worth a blank
 * page, so every access is guarded.
 */

/** Makes both storages throw on access, as a blocking browser does. */
async function blockStorage(page: Page) {
  await page.addInitScript(() => {
    const refuse = () => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    };
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      get: refuse,
    });
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: refuse,
    });
  });
}

test.describe("site data blocked", () => {
  test("the home page still renders its canvas", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await blockStorage(page);
    await page.goto("/");
    await page.waitForTimeout(2600);

    // The canvas is the whole page: an unguarded read takes it down with the
    // error boundary rather than degrading to a canvas at the origin.
    await expect(page.locator(".vows-canvas")).toHaveCount(1);
    expect(await page.locator(".vows-tile").count()).toBeGreaterThan(0);
    await expect(page.getByText("Something went wrong")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("the album page still renders its gallery and footer", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await blockStorage(page);
    await page.goto("/albums/lena-and-matteo");
    await page.waitForTimeout(2200);

    await expect(page.locator("[data-album-photo]")).toHaveCount(18);
    await expect(page.locator("[data-site-footer]")).toHaveCount(1);
    await expect(page.getByText("Something went wrong")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("the music toggle survives a blocked write", async ({ page }) => {
    await blockStorage(page);
    await page.goto("/");
    await page.waitForTimeout(2600);

    const toggle = page.locator(".vows-player-toggle").first();
    await expect(toggle).toHaveCount(1);

    // Driven from script rather than the pointer: the control is hidden until
    // the chrome reveals, and what is under test is the handler — it writes
    // the remembered choice, which is the call that throws when storage is
    // refused.
    const before = await toggle.getAttribute("aria-pressed");
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>(".vows-player-toggle")?.click();
    });
    await page.waitForTimeout(700);

    await expect(page.getByText("Something went wrong")).toHaveCount(0);
    // It still answers the click — the toggle reports a state either way,
    // rather than the handler dying halfway through.
    expect(await toggle.getAttribute("aria-pressed")).not.toBeNull();
    expect(typeof before).toBe("string");
  });
});

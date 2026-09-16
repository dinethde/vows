import { expect, test } from "@playwright/test";

/**
 * Getting into and out of an album (DESIGN.md §12.8).
 *
 * Only runs at desktop: the home page's canvas pans identically at every
 * breakpoint, and driving it three times over tells us nothing new.
 */
test.describe("navigation", () => {
  // The home page canvas pans identically at every breakpoint, so driving it
  // three times over tells us nothing new.
  // eslint-disable-next-line no-empty-pattern -- Playwright passes fixtures first
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "canvas navigation is breakpoint-independent",
    );
  });

  test("a home page tile opens that event's album", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2200);

    // Tile 0 bleeds off the left edge by design; pick one that is on screen.
    const tile = page.locator('[data-tile="5"] .vows-tile-link').first();
    const href = await tile.getAttribute("href");
    expect(href).toMatch(/^\/albums\//);

    // Freeze the drift so the click lands on the tile rather than beside it.
    await page.addStyleTag({ content: ".vows-tile{transform:none!important}" });
    await tile.click();

    await page.waitForURL(/\/albums\//);
    await expect(page.locator(".vows-album-hero")).toBeVisible();
    await expect(page.locator("[data-album-bar]")).toBeVisible();
  });

  test("a repeated tile opens the same album as its original", async ({ page }) => {
    await page.goto("/");
    // The loading screen covers the canvas for its first few seconds and would
    // swallow a raw coordinate click. Locator clicks retry until actionable;
    // this one has to wait explicitly.
    await page.waitForSelector(".vows-loader", { state: "detached" });
    await page.waitForTimeout(1200);
    await page.addStyleTag({ content: ".vows-tile{transform:none!important}" });

    // The canvas wraps, so after a band of panning the photographs under the
    // cursor are lattice repeats, not the base copy. They have to stay
    // clickable or the gallery goes decorative the moment you explore it.
    await page.evaluate(() => {
      const pan = (document.querySelector(".vows-canvas") as HTMLElement & {
        __vowsPan?: { targetX: number; targetY: number; x: number; y: number };
      }).__vowsPan!;
      pan.targetX = pan.x = 1860;
      pan.targetY = pan.y = 1531;
    });
    await page.waitForTimeout(600);

    const onScreen = await page.evaluate(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const tiles = [...document.querySelectorAll<HTMLElement>(".vows-tile")].filter(
        (t) => {
          const r = t.getBoundingClientRect();
          return r.left < vw && r.right > 0 && r.top < vh && r.bottom > 0;
        },
      );
      return {
        total: tiles.length,
        dead: tiles.filter((t) => {
          const link = t.querySelector("a");
          return (
            !link ||
            getComputedStyle(link).pointerEvents === "none" ||
            !!t.closest("[inert]")
          );
        }).length,
      };
    });
    expect(onScreen.total).toBeGreaterThan(0);
    expect(onScreen.dead).toBe(0);

    // Only the base copy stays in the tab order, so a keyboard visitor meets
    // 22 photographs rather than every copy of them.
    const tabbable = await page.evaluate(
      () =>
        [...document.querySelectorAll<HTMLAnchorElement>(".vows-tile-link")].filter(
          (a) => a.tabIndex !== -1 && !a.closest("[inert]"),
        ).length,
    );
    expect(tabbable).toBe(22);

    const target = await page.evaluate(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const repeat = [
        ...document.querySelectorAll<HTMLElement>(
          '[data-cell][aria-hidden="true"] .vows-tile',
        ),
      ].find((t) => {
        const r = t.getBoundingClientRect();
        return r.left > 0 && r.right < vw && r.top > 60 && r.bottom < vh;
      });
      if (!repeat) return null;
      const r = repeat.getBoundingClientRect();
      return {
        href: repeat.querySelector("a")!.getAttribute("href"),
        x: Math.round(r.left + r.width / 2),
        y: Math.round(r.top + r.height / 2),
      };
    });
    expect(target).not.toBeNull();

    // Polled rather than `waitForURL`: this is a raw coordinate click, so
    // Playwright has no navigation to attach to and waits for a `load` that a
    // client-side transition never fires.
    await page.mouse.click(target!.x, target!.y);
    await expect
      .poll(() => new URL(page.url()).pathname)
      .toBe(target!.href);
  });

  test("a deep link to an album works on its own", async ({ page }) => {
    const response = await page.goto("/albums/lena-and-matteo");
    expect(response?.status()).toBe(200);
    await expect(page.locator(".vows-album-hero")).toBeVisible();
    await expect(page.getByText("Lena & Matteo").first()).toBeVisible();
    await expect(page.locator("[data-album-photo]")).toHaveCount(18);
  });

  test("an unknown album does not crash the page", async ({ page }) => {
    await page.goto("/albums/not-a-real-album");
    await expect(page.getByText("could not be found")).toBeVisible();
  });

  test("a slug naming an inherited Object member is still unknown", async ({
    page,
  }) => {
    // A bare `albums[slug]` hands these back as real values.
    for (const slug of ["constructor", "__proto__", "toString"]) {
      const response = await page.goto(`/albums/${slug}`);
      expect(response?.status(), slug).toBe(404);
      await expect(page.getByText("could not be found")).toBeVisible();
    }
  });

  test("browser back restores the canvas position", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2200);

    // Pan somewhere specific, then confirm we return to it and not to origin.
    await page.evaluate(() => {
      const pan = (document.querySelector(".vows-canvas") as HTMLElement & {
        __vowsPan?: { targetX: number; targetY: number; x: number; y: number };
      }).__vowsPan!;
      pan.targetX = pan.x = 120;
      pan.targetY = pan.y = 90;
    });
    await page.waitForTimeout(400);

    await page.addStyleTag({ content: ".vows-tile{transform:none!important}" });
    await page.locator('[data-tile="14"] .vows-tile-link').first().click();
    await page.waitForURL(/\/albums\//);

    await page.goBack();
    await page.waitForURL((url) => url.pathname === "/");
    await page.waitForTimeout(1200);

    const restored = await page.evaluate(() => {
      const pan = (document.querySelector(".vows-canvas") as HTMLElement & {
        __vowsPan?: { targetX: number; targetY: number };
      }).__vowsPan!;
      return { x: Math.round(pan.targetX), y: Math.round(pan.targetY) };
    });

    expect(Math.abs(restored.x - 120)).toBeLessThan(40);
    expect(Math.abs(restored.y - 90)).toBeLessThan(40);
  });

  test("the album is reachable and readable by keyboard alone", async ({ page }) => {
    await page.goto("/albums/benali-and-yasiru");
    await page.waitForTimeout(1400);

    // Tab reaches the skip link first, then the navbar.
    await page.keyboard.press("Tab");
    const first = await page.evaluate(() =>
      (document.activeElement?.textContent ?? "").trim(),
    );
    expect(first).toContain("Skip");

    const reachable = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("a[href], button")].filter((el) => {
        const s = getComputedStyle(el);
        return s.display !== "none" && s.visibility !== "hidden" && !el.closest("[inert]");
      }).length,
    );
    expect(reachable).toBeGreaterThan(3);

    // The page scrolls with the keyboard, which is the only way through it
    // without a pointer.
    await page.locator("body").click({ position: { x: 5, y: 5 } });
    const before = await page.evaluate(() => window.scrollY);
    await page.keyboard.press("PageDown");
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => window.scrollY);
    expect(after).toBeGreaterThan(before);
  });
});

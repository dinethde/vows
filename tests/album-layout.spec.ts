import { expect, test, type Page } from "@playwright/test";

const FEATURED = "/albums/benali-and-yasiru";

/** Waits until the gallery has laid out and the reveal tweens have settled. */
async function settle(page: Page) {
  await page.waitForSelector("[data-album-photo]");
  await page.waitForTimeout(1200);
}

function box(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
}

test.describe("album hero", () => {
  test("the couple is the page's heading", async ({ page }) => {
    await page.goto(FEATURED);
    await page.waitForSelector(".vows-album-hero");

    // The couple is the page's subject and its `<title>`; without an `<h1>`
    // the outline began at the footer's `<h2>`s and a screen reader skimming
    // by heading never met the event's name.
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveCount(1);
    await expect(heading).toHaveText("Benali & Yasiru");
    expect(await page.title()).toContain("Benali & Yasiru");

    // Promoting the element must not move it: the type comes from a class.
    const type = await heading.evaluate((el) => {
      const style = getComputedStyle(el);
      return { size: style.fontSize, family: style.fontFamily.split(",")[0] };
    });
    expect(type.size).toBe("28px");
    expect(type.family).toContain("Mate");
  });

  test("the photograph is cropped to the album's focal point", async ({
    page,
  }, testInfo) => {
    await page.goto(FEATURED);
    await page.waitForSelector(".vows-album-hero-img");

    // Two focal points per album, picked by aspect: a 3:2 source cropped
    // blindly into a tall viewport loses the subject (DESIGN.md §12.3).
    const focus = await page.evaluate(() => {
      const img = document.querySelector(".vows-album-hero-img")!;
      const style = getComputedStyle(img);
      return {
        object: style.objectPosition,
        background: style.backgroundPosition,
      };
    });

    const portrait = testInfo.project.use.viewport!.height >
      testInfo.project.use.viewport!.width;
    expect(focus.object).toBe(portrait ? "58% 45%" : "50% 42%");
    // The placeholder underneath has to sit on the same point, or the image
    // shifts as it loads.
    expect(focus.background).toBe(focus.object);
    expect(focus.object).not.toBe("50% 50%");
  });

  test("fills the viewport and carries the four metadata zones", async ({
    page,
  }, testInfo) => {
    await page.goto(FEATURED);
    await settle(page);

    const viewport = page.viewportSize()!;
    const hero = await box(page, ".vows-album-hero");
    expect(hero.w).toBeCloseTo(viewport.width, 0);
    // 100svh equals 100vh in a headless browser with no dynamic chrome.
    expect(hero.h).toBeCloseTo(viewport.height, 0);

    // The bar sits on the hero's bottom edge at every breakpoint.
    const bar = await box(page, "[data-album-bar]");
    expect(Math.round(bar.y + bar.h)).toBe(Math.round(hero.y + hero.h));

    // And its four zones fit inside it. The hero clips, so a zone that
    // overflows is a zone the visitor never sees.
    const clipped = await page.evaluate(() => {
      const el = document.querySelector("[data-album-bar]")!;
      const rect = el.getBoundingClientRect();
      return {
        overflow: el.scrollWidth - el.clientWidth,
        outside: [...el.querySelectorAll("*")]
          .filter((node) => !node.children.length && node.textContent!.trim())
          .filter((node) => {
            const child = node.getBoundingClientRect();
            return child.right > rect.right + 1 || child.left < rect.left - 1;
          })
          .map((node) => node.textContent!.trim().slice(0, 16)),
      };
    });
    expect(clipped.outside).toEqual([]);
    expect(clipped.overflow).toBeLessThanOrEqual(0);

    // Figma's 88px bar holds at desktop; the compact ones grow rather than
    // shrinking the type (DESIGN.md §12.5).
    const expected = { desktop: 88, tablet: 112, mobile: 168 }[
      testInfo.project.name as "desktop" | "tablet" | "mobile"
    ];
    expect(bar.h).toBeGreaterThanOrEqual(expected);

    for (const text of [
      "Benali & Yasiru",
      "Wedding",
      "Mount Lavinia, Sri Lanka",
      "01/02/2022",
    ]) {
      await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
    }

    // The parenthetical-italic label pattern survives every breakpoint.
    const label = page.getByText("(type)", { exact: true });
    await expect(label).toBeVisible();
    await expect(label).toHaveCSS("font-style", "italic");
  });

  test("the navbar pins for the whole page while the hero scrolls away", async ({
    page,
  }) => {
    await page.goto(FEATURED);
    await settle(page);

    const navbar = page.locator('[data-chrome="top"]');
    await expect(navbar).toBeVisible();
    const before = await box(page, '[data-chrome="top"]');

    await page.evaluate(() => window.scrollTo(0, 4000));
    await page.waitForTimeout(400);

    const after = await box(page, '[data-chrome="top"]');
    expect(after.y).toBeCloseTo(before.y, 0);
    await expect(navbar).toBeVisible();

    // The hero has genuinely left, rather than pinning or parallaxing.
    const hero = await box(page, ".vows-album-hero");
    expect(hero.y).toBeLessThan(-1000);
  });
});

test.describe("album gallery", () => {
  test("renders every photograph from the album's data", async ({ page }) => {
    await page.goto(FEATURED);
    await settle(page);
    await expect(page.locator("[data-album-photo]")).toHaveCount(18);
  });

  test("a shorter album lays out on the same rules", async ({ page }) => {
    // Tara & Elias carries 11 photographs, not 18.
    await page.goto("/albums/tara-and-elias");
    await settle(page);
    await expect(page.locator("[data-album-photo]")).toHaveCount(11);

    // No arrangement is left half-empty, and nothing escapes the column.
    const overflow = await page.evaluate(() => {
      const w = document.documentElement.clientWidth;
      return [...document.querySelectorAll("[data-album-photo]")].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.left < -1 || r.right > w + 1;
      }).length;
    });
    expect(overflow).toBe(0);
  });

  test("photographs never overlap each other", async ({ page }) => {
    await page.goto(FEATURED);
    await settle(page);

    const clashes = await page.evaluate(() => {
      // Measured against the laid-out box, with the float's transform removed,
      // so a drifting photograph is not mistaken for an overlapping one.
      const boxes = [...document.querySelectorAll<HTMLElement>("[data-album-photo]")].map(
        (el) => ({
          l: el.offsetLeft,
          t: el.offsetTop,
          r: el.offsetLeft + el.offsetWidth,
          b: el.offsetTop + el.offsetHeight,
        }),
      );
      let hits = 0;
      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          const a = boxes[i]!;
          const b = boxes[j]!;
          if (a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t) hits += 1;
        }
      }
      return hits;
    });
    expect(clashes).toBe(0);
  });

  test("the vertical rhythm stays uneven", async ({ page }) => {
    await page.goto(FEATURED);
    await settle(page);

    const gaps = await page.evaluate(() => {
      const rows = new Map<number, { top: number; bottom: number }>();
      for (const el of document.querySelectorAll<HTMLElement>("[data-album-photo]")) {
        const top = el.offsetTop;
        const key = Math.round(top / 40);
        const bottom = top + el.offsetHeight;
        const row = rows.get(key);
        if (row) {
          row.top = Math.min(row.top, top);
          row.bottom = Math.max(row.bottom, bottom);
        } else rows.set(key, { top, bottom });
      }
      const ordered = [...rows.values()].sort((a, b) => a.top - b.top);
      return ordered.slice(1).map((row, i) => Math.round(row.top - ordered[i]!.bottom));
    });

    // A page with identical gaps between every photograph loses the whole idea.
    const distinct = new Set(gaps.filter((g) => g > 0));
    expect(distinct.size).toBeGreaterThan(3);
  });

  test("the page never scrolls sideways, including before hydration", async ({
    page,
  }) => {
    // The server has no viewport, so it renders the desktop column — a 1440px
    // block pinned at `left: 50%` that hangs off the side of a phone until the
    // client corrects it. Sampled per frame from before hydration, because by
    // the time the page settles the evidence is gone.
    await page.addInitScript(() => {
      (window as unknown as { __overflow: number[] }).__overflow = [];
      const tick = () => {
        const root = document.documentElement;
        const log = (window as unknown as { __overflow: number[] }).__overflow;
        log.push(root.scrollWidth - root.clientWidth);
        if (log.length < 90) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    await page.goto(FEATURED);
    await settle(page);
    await page.evaluate(() => window.scrollBy(0, 1600));
    await page.waitForTimeout(1200);

    const result = await page.evaluate(() => {
      const root = document.documentElement;
      const rects = [
        ...document.querySelectorAll("[data-album-photo]"),
      ].map((photo) => photo.getBoundingClientRect());
      return {
        worst: Math.max(
          ...(window as unknown as { __overflow: number[] }).__overflow,
        ),
        settled: root.scrollWidth - root.clientWidth,
        // Clipping the overflow must not clip the photographs themselves.
        outside: rects.filter(
          (rect) => rect.right > root.clientWidth + 1 || rect.left < -1,
        ).length,
        rendered: rects.filter((rect) => rect.width > 0 && rect.height > 0).length,
      };
    });

    expect(result.worst).toBe(0);
    expect(result.settled).toBeLessThanOrEqual(0);
    expect(result.outside).toBe(0);
    expect(result.rendered).toBe(18);
  });

  test("a cached photograph still lifts its fade", async ({ page }) => {
    // The `load` event is the only thing that clears `opacity: 0`, and an
    // image already decoded before hydration never fires one — so this is the
    // second visit, where every derivative is warm in the cache.
    await page.goto(FEATURED);
    await settle(page);
    await page.evaluate(() => window.scrollBy(0, 1200));
    await page.waitForTimeout(1500);

    await page.reload();
    await settle(page);
    await page.evaluate(() => window.scrollBy(0, 1200));
    await page.waitForTimeout(1500);

    const decoded = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLImageElement>(".vows-album-img")]
        .filter((img) => img.complete && img.naturalWidth > 0)
        .map((img) => ({
          src: img.currentSrc.split("/").pop(),
          loaded: img.dataset.loaded,
          opacity: getComputedStyle(img).opacity,
        })),
    );

    expect(decoded.length).toBeGreaterThan(0);
    expect(decoded.filter((img) => img.loaded !== "true")).toEqual([]);
    expect(decoded.filter((img) => img.opacity === "0")).toEqual([]);
  });

  test("every photograph has a reserved box and a placeholder", async ({ page }) => {
    await page.goto(FEATURED);
    await page.waitForSelector("[data-album-photo]");

    const unreserved = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("[data-album-photo]")].filter(
        (el) => !el.style.width || !el.style.height,
      ).length,
    );
    expect(unreserved).toBe(0);

    const withoutLqip = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("[data-album-reveal]")].filter(
        (el) => !el.style.backgroundImage.includes("data:image/webp"),
      ).length,
    );
    expect(withoutLqip).toBe(0);
  });
});

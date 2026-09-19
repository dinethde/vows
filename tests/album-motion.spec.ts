import { expect, test } from "@playwright/test";

const FEATURED = "/albums/benali-and-yasiru";

/**
 * Scroll reveal and idle float are separate systems (DESIGN.md §12.7). These
 * specs exist mostly to stop them being collapsed back into one.
 */
test.describe("album motion", () => {
  test("scroll reveal fires once per photograph, on entry", async ({ page }) => {
    await page.goto(FEATURED);
    await page.waitForSelector("[data-album-photo]");
    // The reveal effect sets the starting opacity; give it a frame or two.
    await page.waitForTimeout(500);

    // Below the fold and unrevealed.
    const hidden = await page.evaluate(() => {
      const els = [...document.querySelectorAll<HTMLElement>("[data-album-reveal]")];
      return els.filter((el) => Number(getComputedStyle(el).opacity) < 0.2).length;
    });
    expect(hidden).toBeGreaterThan(0);

    // Scroll through the page rather than jumping to the end: a reveal fires
    // when a photograph comes into view, so anything skipped over never had a
    // chance to. This is what a visitor actually does.
    for (;;) {
      const atEnd = await page.evaluate(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const next = Math.min(max, window.scrollY + window.innerHeight * 0.8);
        window.scrollTo(0, next);
        return next >= max - 1;
      });
      await page.waitForTimeout(300);
      if (atEnd) break;
    }
    await page.waitForTimeout(1600);

    const stillHidden = await page.evaluate(
      () =>
        [...document.querySelectorAll<HTMLElement>("[data-album-reveal]")].filter(
          (el) => Number(getComputedStyle(el).opacity) < 0.9,
        ).length,
    );
    expect(stillHidden).toBe(0);

    // Scrolling back up must not re-hide anything — a reveal is one-shot.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(900);
    const rehidden = await page.evaluate(
      () =>
        [...document.querySelectorAll<HTMLElement>("[data-album-reveal]")].filter(
          (el) => Number(getComputedStyle(el).opacity) < 0.9,
        ).length,
    );
    expect(rehidden).toBe(0);
  });

  test("idle float drifts independently of scroll, and out of step", async ({
    page,
  }) => {
    await page.goto(FEATURED);
    await page.waitForSelector("[data-album-photo]");
    await page.waitForTimeout(800);

    const read = () =>
      page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("[data-album-photo]")]
          .slice(0, 8)
          .map((el) => el.style.transform),
      );

    const first = await read();
    // No scrolling at all between the two reads: the float is its own system.
    await page.waitForTimeout(900);
    const second = await read();

    expect(second.some((t, i) => t !== first[i])).toBe(true);
    // No two photographs share an offset, or the field would pulse in unison.
    expect(new Set(second).size).toBeGreaterThan(4);
  });

  test("a cached hero is not blanked and faded back in", async ({
    browser,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "the entrance is not responsive");

    const context = await browser.newContext({
      viewport: testInfo.project.use.viewport,
    });

    // Prime the cache, then sample opacity per frame from before hydration.
    const primer = await context.newPage();
    await primer.goto(FEATURED);
    await primer.waitForLoadState("networkidle");
    await primer.waitForTimeout(1200);
    await primer.close();

    await context.addInitScript(() => {
      (window as unknown as { __opacity: number[] }).__opacity = [];
      const tick = () => {
        const img = document.querySelector(".vows-album-hero-img");
        const log = (window as unknown as { __opacity: number[] }).__opacity;
        if (img) log.push(Number(getComputedStyle(img).opacity));
        if (log.length < 60) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    const page = await context.newPage();
    await page.goto(FEATURED);
    await page.waitForTimeout(2200);

    const samples = await page.evaluate(
      () => (window as unknown as { __opacity: number[] }).__opacity,
    );
    expect(samples.length).toBeGreaterThan(10);

    // The markup is server-rendered at full opacity, so fading a decoded
    // hero "in" means removing a photograph the visitor is already looking
    // at. Nothing may take it from visible back to invisible.
    const blanked = samples.some(
      (value, index) => index > 0 && samples[index - 1]! > 0.9 && value < 0.1,
    );
    expect(blanked).toBe(false);
    expect(Math.min(...samples)).toBeGreaterThan(0.9);

    await context.close();
  });

  test("reduced motion holds the float still and drops the travel", async ({
    browser,
  }, testInfo) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: testInfo.project.use.viewport,
    });
    const page = await context.newPage();
    await page.goto(FEATURED);
    await page.waitForSelector("[data-album-photo]");
    await page.waitForTimeout(1200);

    const read = () =>
      page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("[data-album-photo]")]
          .slice(0, 6)
          .map((el) => el.style.transform || "none"),
      );

    const first = await read();
    await page.waitForTimeout(900);
    expect(await read()).toEqual(first);

    // Images still arrive, they just do not travel to get there.
    await page.evaluate(() => window.scrollTo(0, 2500));
    await page.waitForTimeout(1200);
    const revealed = await page.evaluate(
      () =>
        [...document.querySelectorAll<HTMLElement>("[data-album-reveal]")].filter(
          (el) => Number(getComputedStyle(el).opacity) > 0.9,
        ).length,
    );
    expect(revealed).toBeGreaterThan(0);

    await context.close();
  });
});

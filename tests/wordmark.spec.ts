import { expect, test, type Page } from "@playwright/test";

/**
 * The wordmark's character field (DESIGN.md §13.10).
 *
 * The field is decoration over a real heading, and the things worth asserting
 * are the ones that would quietly regress: the name staying in the markup, the
 * canvas staying out of the accessibility tree, reduced motion getting the
 * plain wordmark, and the footer's geometry not moving because of any of it.
 */

const ALBUM = "/albums/lena-and-matteo";
const HEADING = ".vows-footer-wordmark";
const CANVAS = ".vows-wordmark-canvas";

/** Scrolls to the footer and waits for the field to settle after its entrance. */
async function toFooter(page: Page) {
  await page.goto(ALBUM);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1800);
}

/** Share of the canvas carrying ink — the field's density. */
function inkRatio(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>(
      ".vows-wordmark-canvas",
    )!;
    const pixels = canvas
      .getContext("2d")!
      .getImageData(0, 0, canvas.width, canvas.height).data;
    let inked = 0;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i]! > 10) inked += 1;
    return inked / (canvas.width * canvas.height);
  });
}

test.describe("wordmark — the name itself", () => {
  test("the real text is in the markup and named for assistive tech", async ({
    page,
    request,
  }) => {
    // Server-rendered, not drawn: this is the studio's name and the largest
    // text on the site, so it cannot live only in a canvas.
    const html = await (await request.get(ALBUM)).text();
    expect(html).toContain("Vows");
    expect(html).toContain("Weddings");

    await toFooter(page);
    const heading = page.locator(HEADING);
    await expect(heading).toHaveRole("heading");
    // Exactly the name — no stray characters from the field.
    await expect(heading).toHaveAccessibleName("Vows Weddings");
    await expect(heading).toHaveText(/^\s*Vows\s+Weddings\s*$/);
  });

  test("the canvas is decoration", async ({ page }) => {
    await toFooter(page);
    const canvas = page.locator(CANVAS);
    await expect(canvas).toHaveAttribute("aria-hidden", "true");

    // Decoration does not take the pointer either: the field listens on the
    // window, so text selection and clicks belong to the page.
    const pointerEvents = await canvas.evaluate(
      (el) => getComputedStyle(el).pointerEvents,
    );
    expect(pointerEvents).toBe("none");
  });

  test("reduced motion gets the plain wordmark", async ({ browser }, testInfo) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: testInfo.project.use.viewport,
    });
    const page = await context.newPage();
    await toFooter(page);

    // No canvas at all — not a stopped one.
    await expect(page.locator(CANVAS)).toHaveCount(0);
    await expect(page.locator(HEADING)).toHaveAttribute("data-particles", "false");

    // And the name is visible ink again rather than the transparent it wears
    // while the canvas draws it. Read as an alpha channel rather than matched
    // against a colour string, which the design-literal rule rejects.
    const opaque = await page.evaluate(() => {
      const colour = getComputedStyle(
        document.querySelector(".vows-footer-wordmark > span")!,
      ).color;
      const channels = colour.match(/[\d.]+/g) ?? [];
      return channels.length < 4 || Number(channels[3]) > 0;
    });
    expect(opaque).toBe(true);

    await context.close();
  });
});

test.describe("wordmark — the field", () => {
  test("it fills the heading's box and nothing else", async ({ page }, testInfo) => {
    await toFooter(page);

    const geometry = await page.evaluate(() => {
      const footer = document.querySelector("[data-site-footer]")!;
      const root = footer.getBoundingClientRect();
      const text = footer
        .querySelector(".vows-footer-wordmark > span")!
        .getBoundingClientRect();
      const canvas = footer
        .querySelector(".vows-wordmark-canvas")!
        .getBoundingClientRect();
      return {
        panel: Math.round(root.height),
        viewport: window.innerHeight,
        text: {
          y: Math.round(text.y - root.y),
          w: Math.round(text.width),
          h: Math.round(text.height),
        },
        canvas: {
          y: Math.round(canvas.y - root.y),
          w: Math.round(canvas.width),
          h: Math.round(canvas.height),
        },
      };
    });

    // The field occupies the text's box exactly, which is what keeps the
    // three bands and the one-screen height where they were.
    expect(geometry.canvas).toEqual(geometry.text);
    expect(geometry.panel).toBe(geometry.viewport);
    expect(geometry.text.y).toBe(
      { desktop: 479, tablet: 617, mobile: 511 }[testInfo.project.name]!,
    );
  });

  test("the name is legible — the field is dense but not solid", async ({
    page,
  }) => {
    await toFooter(page);
    const ink = await inkRatio(page);

    // Black on white: too sparse reads as dirt, too dense as a smudge. The
    // fence is the tuned range — the field was thinned deliberately (§13.10),
    // so the floor sits below where the first, denser version landed.
    expect(ink).toBeGreaterThan(0.025);
    expect(ink).toBeLessThan(0.28);
  });

  test("the characters keep changing while the words stay put", async ({
    page,
  }) => {
    await toFooter(page);

    const snapshot = () =>
      page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>(
          ".vows-wordmark-canvas",
        )!;
        const pixels = canvas
          .getContext("2d")!
          .getImageData(0, 0, canvas.width, canvas.height).data;
        // A coarse column profile: where the ink is, not which glyph it is.
        const columns = new Array(40).fill(0);
        let hash = 0;
        for (let y = 0; y < canvas.height; y += 2) {
          for (let x = 0; x < canvas.width; x += 2) {
            if (pixels[(y * canvas.width + x) * 4 + 3]! <= 10) continue;
            columns[Math.floor((x / canvas.width) * 40)] += 1;
            hash = (hash + x * 31 + y * 17) % 1_000_003;
          }
        }
        return { columns, hash };
      });

      const first = await snapshot();
      await page.waitForTimeout(2200);
      const second = await snapshot();

    // The glyphs reshuffled...
    expect(second.hash).not.toBe(first.hash);

    // ...but the letterforms did not move: every column keeps its share of
    // the ink, within the wobble of a field that is always breathing.
    const total = (columns: number[]) => columns.reduce((a, b) => a + b, 0);
    const firstTotal = total(first.columns);
    const secondTotal = total(second.columns);
    expect(Math.abs(secondTotal - firstTotal) / firstTotal).toBeLessThan(0.25);

    const drift = first.columns.map((value, index) =>
      Math.abs(value / firstTotal - second.columns[index]! / secondTotal),
    );
    expect(Math.max(...drift)).toBeLessThan(0.05);
  });

  test("the pointer opens a hole that follows it", async ({ page }) => {
    await toFooter(page);
    const box = (await page.locator(`${HEADING} > span`).boundingBox())!;

    /** Ink within a radius of a point on the canvas. */
    const inkAround = (fraction: number) =>
      page.evaluate((at) => {
        const canvas = document.querySelector<HTMLCanvasElement>(
          ".vows-wordmark-canvas",
        )!;
        const radius = Number.parseFloat(
          getComputedStyle(canvas).getPropertyValue("--wordmark-repel-radius"),
        );
        // Integer centres: a fractional loop index reads past the pixel array
        // and every probe comes back empty.
        const cx = Math.round(canvas.width * at);
        const cy = Math.round(canvas.height / 2);
        const pixels = canvas
          .getContext("2d")!
          .getImageData(0, 0, canvas.width, canvas.height).data;
        let inked = 0;
        for (let y = Math.max(0, cy - radius); y < Math.min(canvas.height, cy + radius); y += 1) {
          for (let x = Math.max(0, cx - radius); x < Math.min(canvas.width, cx + radius); x += 1) {
            // Well inside the hole: the displaced characters pile up on its
            // rim, and counting them back in measures nothing.
            if (Math.hypot(x - cx, y - cy) > radius * 0.45) continue;
            if (pixels[(y * canvas.width + x) * 4 + 3]! > 10) inked += 1;
          }
        }
        return inked;
      }, fraction);

    const at = 0.62;
    const before = await inkAround(at);
    expect(before).toBeGreaterThan(0);

    await page.mouse.move(box.x + box.width * at, box.y + box.height / 2);
    await page.waitForTimeout(500);
    const during = await inkAround(at);

    // The characters got out of the way.
    expect(during).toBeLessThan(before * 0.5);

    // And came back when the pointer left.
    await page.mouse.move(box.x + box.width / 2, box.y - 400);
    await page.waitForTimeout(1600);
    const after = await inkAround(at);
    expect(after).toBeGreaterThan(before * 0.7);
  });

  test("the loop stops when the footer leaves the viewport", async ({ page }) => {
    await toFooter(page);

    const draws = await page.evaluate(async () => {
      const canvas = document.querySelector<HTMLCanvasElement>(
        ".vows-wordmark-canvas",
      )!;
      const context = canvas.getContext("2d")!;
      let count = 0;
      const original = context.fillText.bind(context);
      // Counting real draws rather than trusting a flag: a leaked rAF loop is
      // exactly the bug this test exists for.
      context.fillText = ((...args: Parameters<typeof original>) => {
        count += 1;
        return original(...args);
      }) as typeof context.fillText;

      const sample = async (ms: number) => {
        count = 0;
        await new Promise((resolve) => setTimeout(resolve, ms));
        return count;
      };

      const inView = await sample(400);
      window.scrollTo(0, 0);
      await new Promise((resolve) => setTimeout(resolve, 900));
      const outOfView = await sample(400);
      return { inView, outOfView };
    });

    expect(draws.inView).toBeGreaterThan(0);
    expect(draws.outOfView).toBe(0);
  });
});

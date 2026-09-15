import { expect, test } from "@playwright/test";

/**
 * The footer panel (DESIGN.md §13).
 *
 * The first two tests are the fence: the footer belongs to content pages and
 * must never appear on the home page, whose canvas has no bottom to sit below.
 * That is the requirement most likely to be undone by a later change, so it is
 * asserted at every breakpoint rather than described in prose.
 */

const footer = "[data-site-footer]";

test.describe("footer placement", () => {
  test("the album page has the footer at the very bottom", async ({ page }) => {
    await page.goto("/albums/lena-and-matteo");
    const panel = page.locator(footer);
    await expect(panel).toHaveCount(1);

    // Last thing in the document, after the gallery — not floating over it.
    const isLast = await page.evaluate(() => {
      const el = document.querySelector("[data-site-footer]");
      const main = document.querySelector("main");
      return {
        afterMain: !!(
          main && el && main.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING
        ),
        position: getComputedStyle(el!).position,
      };
    });
    expect(isLast.afterMain).toBe(true);
    expect(isLast.position).toBe("static");
  });

  test("the home page has no footer", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2200);
    await expect(page.locator(footer)).toHaveCount(0);

    // And panning to the bottom of the canvas does not summon one.
    await page.mouse.move(400, 400);
    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(600);
    await expect(page.locator(footer)).toHaveCount(0);
  });

  test("a page added under the site layout inherits it", async ({ page }) => {
    // The album not-found page is a different route component under the same
    // layout; if the footer were imported into the album page instead of the
    // layout, this would be empty.
    await page.goto("/albums/not-a-real-album");
    await expect(page.locator(footer)).toHaveCount(1);
  });
});

test.describe("footer structure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/albums/lena-and-matteo");
    await page.locator(footer).scrollIntoViewIfNeeded();
    // The email link is deliberately inert until the client attaches its href
    // (DESIGN.md §13.6), so everything about links waits for hydration first.
    await expect(page.locator(".vows-footer-email")).toHaveAttribute(
      "href",
      /^mailto:/,
    );
  });

  test("the labels are list headings, not links", async ({ page }) => {
    const labels = page.locator(`${footer} h2`);
    await expect(labels).toHaveCount(5);

    // Signage: not focusable, not a link, and not styled as one.
    const state = await page.evaluate(() => {
      const heads = [...document.querySelectorAll("[data-site-footer] h2")];
      return heads.map((h) => ({
        text: h.textContent,
        tabbable: (h as HTMLElement).tabIndex >= 0,
        anchors: h.querySelectorAll("a").length,
        underlined: getComputedStyle(h).textDecorationLine,
      }));
    });
    for (const label of state) {
      expect(label.tabbable).toBe(false);
      expect(label.anchors).toBe(0);
      expect(label.underlined).toBe("none");
    }
    expect(state.map((l) => l.text)).toEqual([
      "Menu",
      "Socials",
      "Email",
      "Hotline",
      "Studio",
    ]);
  });

  test("the link columns are labelled lists", async ({ page }) => {
    await expect(page.getByRole("list", { name: "Menu" }).locator("li")).toHaveCount(4);
    await expect(page.getByRole("list", { name: "Socials" }).locator("li")).toHaveCount(5);
    await expect(
      page.getByRole("list", { name: "Legal and policies" }).locator("li"),
    ).toHaveCount(4);
  });

  test("every link points somewhere and externals are safe", async ({ page }) => {
    const links = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>("[data-site-footer] a")].map(
        (a) => ({
          text: a.textContent?.trim(),
          href: a.getAttribute("href"),
          target: a.getAttribute("target"),
          rel: a.getAttribute("rel"),
        }),
      ),
    );

    expect(links.length).toBe(15);
    for (const link of links) {
      expect(link.href, `${link.text} has no href`).toBeTruthy();
      if (link.href!.startsWith("http")) {
        expect(link.target).toBe("_blank");
        expect(link.rel).toContain("noreferrer");
      }
    }

    // The three that are not navigation: mail, phone, map.
    expect(links.some((l) => l.href?.startsWith("mailto:"))).toBe(true);
    expect(links.some((l) => l.href?.startsWith("tel:"))).toBe(true);
    expect(links.some((l) => l.href?.includes("google.com/maps"))).toBe(true);
  });

  test("the address is not in the served markup", async ({ page, request }) => {
    const html = await (await request.get("/albums/lena-and-matteo")).text();
    expect(html).not.toContain("dinukadsilva@gmail.com");
    expect(html).not.toContain("mailto:");
    expect(html).not.toMatch(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);

    // But the visitor — and a screen reader — still get the real thing.
    const link = page.locator(".vows-footer-email");
    await expect(link).toHaveAttribute("href", "mailto:dinukadsilva@gmail.com");
    await expect(link).toHaveAttribute("aria-label", "dinukadsilva@gmail.com");
  });

  test("the pin is hidden from assistive technology", async ({ page }) => {
    await expect(page.locator(".vows-footer-pin")).toHaveAttribute("aria-hidden", "true");
  });

  test("the footer is reachable by keyboard and nothing is trapped", async ({
    page,
  }) => {
    const reached = await page.evaluate(async () => {
      const links = [
        ...document.querySelectorAll<HTMLAnchorElement>("[data-site-footer] a"),
      ];
      // Focus each in turn; a link that cannot take focus is unreachable by
      // keyboard however it looks.
      return links.filter((a) => {
        a.focus();
        return document.activeElement === a;
      }).length;
    });
    expect(reached).toBe(15);

    // Tabbing from the last link leaves the footer rather than cycling in it.
    await page.locator("[data-site-footer] a").last().focus();
    await page.keyboard.press("Tab");
    const stillInside = await page.evaluate(
      () => !!document.activeElement?.closest("[data-site-footer]"),
    );
    expect(stillInside).toBe(false);
  });
});

test.describe("footer layout", () => {
  test("the panel matches the frame it was drawn from", async ({ page }, testInfo) => {
    await page.goto("/albums/lena-and-matteo");
    await page.locator(footer).scrollIntoViewIfNeeded();

    const geometry = await page.evaluate(() => {
      const el = document.querySelector("[data-site-footer]")!;
      const root = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const boxes = (selector: string) =>
        [...el.querySelectorAll(selector)]
          .filter((node) => node.getBoundingClientRect().width > 0)
          .map((node) => {
            const box = node.getBoundingClientRect();
            return { x: Math.round(box.x - root.x), y: Math.round(box.y - root.y) };
          });
      return {
        height: Math.round(root.height),
        radius: {
          topLeft: style.borderTopLeftRadius,
          topRight: style.borderTopRightRadius,
          bottomLeft: parseFloat(style.borderBottomLeftRadius),
          bottomRight: parseFloat(style.borderBottomRightRadius),
          token: getComputedStyle(document.documentElement)
            .getPropertyValue("--footer-radius")
            .trim(),
        },
        columns: boxes(".vows-footer-columns > div, .vows-footer-contact > div"),
        groups: boxes(".vows-footer-columns > div"),
      };
    });

    // Rounded where the page meets it, square along the bottom.
    expect(geometry.radius.topLeft).toBe(geometry.radius.token);
    expect(geometry.radius.topRight).toBe(geometry.radius.token);
    expect(geometry.radius.bottomLeft).toBe(0);
    expect(geometry.radius.bottomRight).toBe(0);

    const expected = {
      desktop: { height: 900, columns: [64, 400, 736, 736, 736, 1175] },
      tablet: { height: 681, columns: [40, 210, 390, 390, 390, 630] },
      mobile: { height: 847, columns: [20, 205, 20, 20, 205] },
    }[testInfo.project.name]!;

    expect(geometry.height).toBe(expected.height);
    expect(geometry.columns.map((c) => c.x)).toEqual(expected.columns);

    // The drift in the frame is corrected: while the four groups share a row,
    // they share a top. Mobile breaks them onto three rows deliberately.
    if (testInfo.project.name !== "mobile") {
      expect(geometry.groups.map((g) => g.y)).toEqual([48, 48, 48, 48]);
    }
  });

  test("the wordmark fills the gutters without breaking a word", async ({
    page,
  }) => {
    for (const width of [320, 390, 834, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/albums/lena-and-matteo");
      await page.locator(footer).scrollIntoViewIfNeeded();
      await page.waitForLoadState("networkidle");

      const fit = await page.evaluate(() => {
        const wordmark = document.querySelector<HTMLElement>(".vows-footer-wordmark")!;
        const spans = [...wordmark.querySelectorAll("span")];
        const range = document.createRange();
        range.selectNodeContents(wordmark);
        return {
          available: wordmark.getBoundingClientRect().width,
          widest: Math.max(...[...range.getClientRects()].map((r) => r.width)),
          // More than one rect for a span means that word was split across
          // lines — the failure this sizing exists to prevent.
          split: spans.filter((s) => s.getClientRects().length > 1).length,
          overflow:
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        };
      });

      expect(fit.split, `word split at ${width}`).toBe(0);
      expect(fit.widest, `overruns gutters at ${width}`).toBeLessThanOrEqual(
        fit.available,
      );
      expect(fit.overflow, `page scrolls sideways at ${width}`).toBeLessThanOrEqual(0);
    }
  });

  test("the footer arrives still — no reveal or float applies to it", async ({
    page,
  }) => {
    await page.goto("/albums/lena-and-matteo");
    const panel = page.locator(footer);
    await panel.scrollIntoViewIfNeeded();

    // Measured against the gallery above it, in one frame, so that the page
    // growing as images arrive does not read as the footer moving.
    const gap = () =>
      page.evaluate(() => {
        const main = document.querySelector("main")!.getBoundingClientRect();
        const el = document
          .querySelector("[data-site-footer]")!
          .getBoundingClientRect();
        return Math.round(el.top - main.bottom);
      });

    const before = await gap();
    await page.waitForTimeout(1500);
    const after = await gap();

    // The gallery's tiles drift by a few pixels forever; the footer must not.
    expect(after).toBe(before);

    const styles = await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>("[data-site-footer]")!;
      const computed = getComputedStyle(el);
      return {
        opacity: computed.opacity,
        transform: computed.transform,
        animation: computed.animationName,
        reveal: el.querySelectorAll("[data-album-reveal], [data-album-photo]").length,
      };
    });
    expect(styles.opacity).toBe("1");
    expect(styles.transform).toBe("none");
    expect(styles.animation).toBe("none");
    expect(styles.reveal).toBe(0);
  });
});

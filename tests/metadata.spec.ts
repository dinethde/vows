import { expect, test } from "@playwright/test";

/**
 * What an album URL looks like when it leaves the site.
 *
 * An album is the shareable unit here — a couple sends `/albums/<slug>` to
 * family in a chat app — so the head is checked in the served HTML rather
 * than in the DOM: an unfurler never runs the page's JavaScript.
 */

const ALBUM = "/albums/benali-and-yasiru";

test.describe("album metadata", () => {
  // The head is identical at every breakpoint; one project is the whole test.
  // eslint-disable-next-line no-empty-pattern -- Playwright passes fixtures first
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "the head is not responsive");
  });

  test("it unfurls with a photograph, a name and a story", async ({ request }) => {
    const html = await (await request.get(ALBUM)).text();
    const head = html.slice(0, html.indexOf("</head>"));

    const meta = (attribute: string, value: string) =>
      head.match(
        new RegExp(`<meta[^>]*${attribute}="${value}"[^>]*content="([^"]*)"`),
      )?.[1];

    expect(meta("property", "og:type")).toBe("article");
    expect(meta("property", "og:title")).toContain("Benali &amp; Yasiru");
    expect(meta("property", "og:description")).toContain("morning ceremony");
    expect(meta("name", "twitter:card")).toBe("summary_large_image");

    // Absolute, or most clients drop the image and unfurl a bare link.
    const image = meta("property", "og:image");
    expect(image).toMatch(/^https?:\/\//);
    expect(image).toContain("/albums/hero-hero-1280.webp");
    expect(meta("property", "og:url")).toMatch(
      /^https?:\/\/[^/]+\/albums\/benali-and-yasiru$/,
    );
  });

  test("the image it advertises actually exists", async ({ request }) => {
    const html = await (await request.get(ALBUM)).text();
    const image = html.match(/property="og:image"[^>]*content="([^"]*)"/)?.[1];
    expect(image).toBeTruthy();

    // Served from this app, whatever origin the head advertises.
    const path = new URL(image!).pathname;
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image");
  });

  test("each album declares one canonical URL, its own", async ({ request }) => {
    const html = await (await request.get(ALBUM)).text();
    const canonical = html.match(
      /<link[^>]*rel="canonical"[^>]*href="([^"]*)"/,
    )?.[1];

    expect(canonical).toMatch(/\/albums\/benali-and-yasiru$/);

    // A second album must not claim the first one's URL.
    const other = await (await request.get("/albums/lena-and-matteo")).text();
    const otherCanonical = other.match(
      /<link[^>]*rel="canonical"[^>]*href="([^"]*)"/,
    )?.[1];
    expect(otherCanonical).toMatch(/\/albums\/lena-and-matteo$/);
    expect(otherCanonical).not.toBe(canonical);
  });
});

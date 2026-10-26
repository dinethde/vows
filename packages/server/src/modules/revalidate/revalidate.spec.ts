import { describe, expect, it } from "vitest";

import { pathsFor, sign } from "./revalidate.service";

describe("the rebuild call", () => {
  it("names the album page, the home page and the sitemap", () => {
    expect(pathsFor("benali-yasiru")).toEqual(["/albums/benali-yasiru", "/", "/sitemap.xml"]);
  });

  it("adds the old address when the slug changed, so it stops serving the old page", () => {
    expect(pathsFor("benali-yasiru", "album-01")).toContain("/albums/album-01");
  });

  it("signs the exact body, so one changed character breaks the signature", () => {
    const body = JSON.stringify({ paths: ["/"], issuedAt: 1791526403117 });
    expect(sign(body, "secret-one")).toMatch(/^[0-9a-f]{64}$/);
    expect(sign(`${body} `, "secret-one")).not.toBe(sign(body, "secret-one"));
    expect(sign(body, "secret-two")).not.toBe(sign(body, "secret-one"));
  });
});

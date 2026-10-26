import { PermanentJobError } from "@vows/server";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { SHARE_CARD, deriveImage } from "./derive-image";

/** A small real image. The pipeline cares about the bytes, not the picture. */
function image(width: number, height: number): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: { r: 120, g: 90, b: 60 } } })
    .jpeg()
    .toBuffer();
}

describe("deriveImage", () => {
  it("makes five widths in AVIF and WebP, and nothing else, for a gallery photograph", async () => {
    const result = await deriveImage(await image(300, 200), false);
    expect(result.files.map((file) => `${String(file.width)}.${file.format}`)).toEqual([
      "320.avif",
      "320.webp",
      "640.avif",
      "640.webp",
      "1024.avif",
      "1024.webp",
      "1600.avif",
      "1600.webp",
      "2400.avif",
      "2400.webp",
    ]);
  });

  it("adds a 1200 × 630 JPEG share card for a cover", async () => {
    const result = await deriveImage(await image(300, 200), true);
    const card = result.files.at(-1);
    expect(result.files).toHaveLength(11);
    expect(card).toMatchObject({ format: "jpeg", ...SHARE_CARD, contentType: "image/jpeg" });
  });

  it("takes the size and type from the bytes, and keeps the shape of the photograph", async () => {
    const result = await deriveImage(await image(300, 200), false);
    expect(result).toMatchObject({ width: 300, height: 200, mime: "image/jpeg" });
    expect(result.files[0]).toMatchObject({ width: 320, height: 213 });
  });

  it("turns a sideways original the right way up before measuring it", async () => {
    const sideways = await sharp(await image(300, 200))
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const result = await deriveImage(sideways, false);
    expect(result).toMatchObject({ width: 200, height: 300 });
    expect(result.files[0]?.height).toBeGreaterThan(result.files[0]?.width ?? 0);
  });

  it("strips EXIF from what it writes", async () => {
    const tagged = await sharp(await image(300, 200))
      .withExif({ IFD0: { Copyright: "someone", Artist: "someone" } })
      .toBuffer();
    const result = await deriveImage(tagged, false);
    const meta = await sharp(result.files[1]?.body).metadata();
    expect(meta.exif).toBeUndefined();
  });

  it("returns a blur hash of about 25 bytes", async () => {
    const result = await deriveImage(await image(300, 200), false);
    const bytes = Buffer.from(result.thumbhash, "base64").length;
    expect(bytes).toBeGreaterThan(4);
    expect(bytes).toBeLessThan(40);
  });

  it("refuses a file that is not an image, as a failure that will never succeed", async () => {
    await expect(
      deriveImage(Buffer.from("this is not a photograph"), false),
    ).rejects.toBeInstanceOf(PermanentJobError);
  });
});

import { describe, expect, it } from "vitest";

import { galleryCss, sizesFor } from "./gallery-css";
import { BAND_SIZES, FRAMES } from "./gallery-layout";

describe("the gallery layout", () => {
  it("has thirteen bands and eighteen photographs at every width", () => {
    for (const frame of Object.values(FRAMES)) {
      expect(frame.bands).toHaveLength(13);
      expect(frame.bands.flat()).toHaveLength(18);
    }
    expect(BAND_SIZES.reduce((sum, size) => sum + size, 0)).toBe(18);
  });

  it("keeps every photograph inside the frame, and lets only band 12 run edge to edge", () => {
    for (const frame of Object.values(FRAMES)) {
      for (const [index, band] of frame.bands.entries()) {
        for (const item of band) {
          expect(item.x + item.w).toBeLessThanOrEqual(frame.width);
          expect(item.w === frame.width).toBe(index === 11);
        }
      }
    }
  });

  it("adds up to the height of the Figma desktop frame", () => {
    const frame = FRAMES.desktop;
    const heights = frame.bands.map((band) => Math.max(...band.map((item) => item.h)));
    const total =
      frame.padding * 2 + heights.reduce((sum, h) => sum + h, 0) + frame.gap * (heights.length - 1);
    expect(total).toBe(11727);
  });

  it("lifts the small photograph in the overlapping band above its band at every width", () => {
    expect(galleryCss()).toContain("top:-4.5833vw");
    expect(FRAMES.tablet.bands[6]?.[0]?.y).toBe(-40);
    expect(FRAMES.mobile.bands[6]?.[0]?.y).toBe(-30);
  });

  it("tells the browser how wide a photograph is drawn, so it picks a small file on a phone", () => {
    expect(sizesFor(2)).toBe(
      "(min-width: 64rem) 28.4722vw, (min-width: 40rem) 28.777vw, 38.4615vw",
    );
  });
});

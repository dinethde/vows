/**
 * Where each of the eighteen photographs sits, copied from the three Figma
 * gallery frames (1440, 834 and 390 wide). It is not a grid: the positions are
 * the design. Numbers are frame pixels; the stylesheet turns them into a share
 * of the window's width, so the page scales smoothly between the frames.
 */
export interface Box {
  /** Left edge, from the left of the frame. */
  x: number;
  /** Above the band's top edge when negative. Only the overlapping pair uses it. */
  y: number;
  w: number;
  h: number;
}

export interface Frame {
  width: number;
  /** Between one band and the next. */
  gap: number;
  /** Above the first band and below the last. */
  padding: number;
  /** One entry per band, each holding its photographs from left to right. */
  bands: Box[][];
}

const box = (x: number, w: number, h: number, y = 0): Box => ({ x, y, w, h });

export const FRAMES: Record<"mobile" | "tablet" | "desktop", Frame> = {
  desktop: {
    width: 1440,
    gap: 350,
    padding: 166,
    bands: [
      [box(300, 410, 600), box(730, 410, 600)],
      [box(1170, 230, 230)],
      [box(80, 400, 400)],
      [box(890, 410, 600)],
      [box(212, 325, 500), box(557, 325, 500), box(902, 325, 500)],
      [box(104, 475, 750)],
      [box(41, 250, 380, -66), box(649, 750, 750)],
      [box(240, 230, 230)],
      [box(975, 325, 500)],
      [box(240, 325, 500)],
      [box(630, 325, 500), box(975, 325, 500)],
      [box(0, 1440, 1135)],
      [box(240, 325, 500)],
    ],
  },
  tablet: {
    width: 834,
    gap: 220,
    padding: 110,
    bands: [
      [box(167, 240, 350), box(427, 240, 350)],
      [box(652, 150, 150)],
      [box(72, 250, 250)],
      [box(502, 240, 350)],
      [box(97, 200, 308), box(317, 200, 308), box(537, 200, 308)],
      [box(60, 300, 474)],
      [box(32, 160, 243, -40), box(334, 460, 460)],
      [box(152, 150, 150)],
      [box(602, 200, 308)],
      [box(152, 200, 308)],
      [box(382, 200, 308), box(602, 200, 308)],
      [box(0, 834, 657)],
      [box(152, 200, 308)],
    ],
  },
  mobile: {
    width: 390,
    gap: 140,
    padding: 80,
    bands: [
      [box(39, 150, 220), box(201, 150, 220)],
      [box(270, 100, 100)],
      [box(36, 150, 150)],
      [box(200, 150, 220)],
      [box(35, 100, 154), box(145, 100, 154), box(255, 100, 154)],
      [box(25, 200, 316)],
      [box(20, 90, 137, -30), box(150, 220, 220)],
      [box(70, 100, 100)],
      [box(230, 140, 215)],
      [box(70, 140, 215)],
      [box(118, 120, 185), box(250, 120, 185)],
      [box(0, 390, 307)],
      [box(70, 140, 215)],
    ],
  },
};

/** How many photographs each band holds: 2, 1, 1, 1, 3, … Eighteen in all. */
export const BAND_SIZES = FRAMES.desktop.bands.map((band) => band.length);

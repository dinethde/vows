/**
 * The gallery scatter, straight out of the Figma frames (DESIGN.md §3.4).
 * Coordinates are frame coordinates; they are never scaled — the band is
 * tiled on a lattice instead (DESIGN.md §3.2).
 */
import type { PhotoId } from "./photos";

export type Breakpoint = "mobile" | "tablet" | "desktop";

export type TileFamily =
  | "portrait"
  | "landscape"
  | "squareLg"
  | "squareSm"
  | "tall";

export type Tile = {
  /** Stable within a breakpoint; drives keys, stagger order and captions. */
  index: number;
  family: TileFamily;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Image → caption gap. Figma uses 5 everywhere bar one desktop tile. */
  gap: number;
  photo: PhotoId;
  couple: string;
};

export type BandSpec = {
  /** The Figma frame width this breakpoint was drawn at. */
  designWidth: number;
  /** Bounding box of every wrapper, i.e. the lattice period. */
  minX: number;
  minY: number;
  width: number;
  height: number;
  tiles: Tile[];
};

/**
 * 22 couples of deliberately varied length — the longest exercises the caption
 * truncation rule (DESIGN.md D3/D7). Figma repeats one placeholder name.
 */
const couples = [
  "Benali & Yasiru",
  "Amaya & Rohan",
  "Nethmi & Kavinda",
  "Tara & Elias",
  "Sanuli & Dinuka",
  "Imara & Thisath",
  "Lena & Matteo",
  "Hiruni & Pasindu",
  "Juliette & Bastien",
  "Kavisha & Tharindu",
  "Noor & Idris",
  "Anoushka & Wickramasinghe",
  "Maya & Cem",
  "Dilini & Sajith",
  "Freya & Jonas",
  "Rashmi & Akila",
  "Clara & Wu",
  "Senuri & Mihiran",
  "Aiko & Daniel",
  "Nadia & Emre",
  "Piumi & Chathura",
  "Greta & Olav",
] as const;

type Raw = [TileFamily, number, number, number, number, number, PhotoId];

function build(
  designWidth: number,
  minX: number,
  minY: number,
  width: number,
  height: number,
  raw: Raw[],
): BandSpec {
  return {
    designWidth,
    minX,
    minY,
    width,
    height,
    tiles: raw.map(([family, x, y, w, h, gap, photo], index) => ({
      index,
      family,
      x,
      y,
      w,
      h,
      gap,
      photo,
      couple: couples[index % couples.length]!,
    })),
  };
}

export const bands: Record<Breakpoint, BandSpec> = {
  desktop: build(1440, -240, -225, 1860, 1531, [
    ["squareLg", -210, -225, 200, 200, 5, "s1"],
    ["landscape", 860, -200, 230, 150, 5, "l1"],
    ["portrait", 428, -152, 150, 180, 5, "p1"],
    ["squareLg", 1321, -92, 200, 200, 5, "s2"],
    ["tall", 990, 36, 160, 210, 5, "p2"],
    ["landscape", 631, 95, 230, 150, 5, "l2"],
    ["tall", -96, 106, 160, 210, 5, "p3"],
    ["portrait", 256, 170, 150, 180, 5, "p4"],
    ["portrait", 1280, 330, 150, 180, 5, "p5"],
    ["squareSm", 950, 403, 150, 150, 5, "s3"],
    ["squareSm", 6, 447, 150, 150, 5, "s4"],
    ["landscape", 273, 525, 230, 150, 5, "l3"],
    ["landscape", 1365, 613, 230, 150, 5, "l4"],
    ["landscape", -240, 650, 230, 150, 10, "l5"],
    ["landscape", 815, 710, 230, 150, 5, "l6"],
    ["squareLg", 490, 800, 200, 200, 5, "s5"],
    ["portrait", 1164, 838, 150, 180, 5, "p6"],
    ["tall", 126, 863, 160, 210, 5, "p7"],
    ["squareSm", 1470, 1011, 150, 150, 5, "s6"],
    ["landscape", 371, 1061, 230, 150, 5, "l7"],
    ["squareSm", -200, 1073, 150, 150, 5, "s7"],
    ["squareLg", 846, 1086, 200, 200, 5, "s8"],
  ]),

  tablet: build(834, -60, -50, 950, 1185, [
    ["squareLg", 430, -50, 150, 150, 5, "s1"],
    ["landscape", -40, -30, 172, 112, 5, "l1"],
    ["portrait", 230, 60, 112, 135, 5, "p1"],
    ["portrait", 660, 95, 112, 135, 5, "p2"],
    ["squareLg", 40, 170, 150, 150, 5, "s2"],
    ["landscape", 300, 258, 172, 112, 5, "l2"],
    ["squareLg", 690, 300, 150, 150, 5, "s3"],
    ["tall", -60, 380, 120, 157, 5, "p3"],
    ["squareSm", 430, 380, 112, 112, 5, "s4"],
    ["landscape", 130, 400, 172, 112, 5, "l3"],
    ["squareSm", 700, 555, 112, 112, 5, "s5"],
    ["portrait", 60, 620, 112, 135, 5, "p4"],
    ["squareSm", 350, 700, 112, 112, 5, "s6"],
    ["landscape", 600, 760, 172, 112, 5, "l4"],
    ["tall", 770, 860, 120, 157, 5, "p5"],
    ["tall", 200, 930, 120, 157, 5, "p6"],
    ["portrait", 560, 980, 112, 135, 5, "p7"],
  ]),

  mobile: build(390, -50, -40, 473, 946, [
    ["squareLg", 285, -40, 120, 120, 5, "s1"],
    ["landscape", -30, -20, 138, 90, 5, "l1"],
    ["portrait", 140, 55, 96, 115, 5, "p1"],
    ["tall", 10, 120, 100, 131, 5, "p2"],
    ["portrait", 280, 120, 96, 115, 5, "p3"],
    ["landscape", 130, 215, 138, 90, 5, "l2"],
    ["squareLg", -50, 285, 120, 120, 5, "s2"],
    ["landscape", 30, 490, 138, 90, 5, "l3"],
    ["tall", 255, 500, 100, 131, 5, "p4"],
    ["portrait", -20, 640, 96, 115, 5, "p5"],
    ["squareSm", 150, 660, 96, 96, 5, "s3"],
    ["landscape", 285, 715, 138, 90, 5, "l4"],
    ["squareSm", 35, 790, 96, 96, 5, "s4"],
  ]),
};

/** Caption slot height, in px — kept out of layout maths in components. */
export const CAPTION_HEIGHT = 15;

export function tileSlug(tile: Tile) {
  return tile.couple
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

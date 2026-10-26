/**
 * Where the photographs sit on the home canvas, copied from the three Figma
 * home frames. Placed on purpose, never on a grid, with several running off
 * the edges. Each entry is [x, y, width, height] in frame pixels.
 */
export type Tile = readonly [x: number, y: number, w: number, h: number];

/**
 * How much further apart the tiles sit than in Figma. QA round 1: with every
 * place filled the canvas felt crowded, so the places are spread by this much
 * and the photographs keep their drawn sizes. One screen now holds about 40 per
 * cent fewer of them. 1 is the Figma frame exactly.
 */
export const SPREAD = 1.3;

/**
 * A tile's place as a fraction of the frame, spread out from the middle of the
 * frame so the open space around the title stays in the middle.
 */
export function spread(value: number, size: number): number {
  return ((value - size / 2) * SPREAD + size / 2) / size;
}

export interface HomeFrame {
  width: number;
  height: number;
  tiles: readonly Tile[];
}

export const HOME_FRAMES = {
  desktop: {
    width: 1440,
    height: 1024,
    tiles: [
      [1164, 838, 150, 180],
      [1280, 330, 150, 180],
      [256, 170, 150, 180],
      [428, -152, 150, 180],
      [490, 800, 200, 200],
      [273, 525, 230, 150],
      [815, 710, 230, 150],
      [1365, 613, 230, 150],
      [631, 95, 230, 150],
      [990, 36, 160, 210],
      [126, 863, 160, 210],
      [6, 447, 150, 150],
      [950, 403, 150, 150],
      [1321, -92, 200, 200],
      [-210, -225, 200, 200],
      [-96, 106, 160, 210],
      [-200, 1073, 150, 150],
      [1470, 1011, 150, 150],
      [371, 1061, 230, 150],
      [860, -200, 230, 150],
      [846, 1086, 200, 200],
      [-240, 650, 230, 150],
    ],
  },
  tablet: {
    width: 834,
    height: 1194,
    tiles: [
      [230, 60, 112, 135],
      [660, 95, 112, 135],
      [60, 620, 112, 135],
      [560, 980, 112, 135],
      [430, -50, 150, 150],
      [-40, -30, 172, 112],
      [300, 258, 172, 112],
      [130, 400, 172, 112],
      [600, 760, 172, 112],
      [-60, 380, 120, 157],
      [200, 930, 120, 157],
      [700, 555, 112, 112],
      [350, 700, 112, 112],
      [40, 170, 150, 150],
      [690, 300, 150, 150],
      [770, 860, 120, 157],
      [430, 380, 112, 112],
    ],
  },
  mobile: {
    width: 390,
    height: 844,
    tiles: [
      [140, 55, 96, 115],
      [280, 120, 96, 115],
      [-20, 640, 96, 115],
      [-50, 285, 120, 120],
      [-30, -20, 138, 90],
      [130, 215, 138, 90],
      [30, 490, 138, 90],
      [285, 715, 138, 90],
      [10, 120, 100, 131],
      [255, 500, 100, 131],
      [150, 660, 96, 96],
      [35, 790, 96, 96],
      [285, -40, 120, 120],
    ],
  },
} as const satisfies Record<string, HomeFrame>;

export type HomeBreakpoint = keyof typeof HOME_FRAMES;

/** The most photographs the canvas ever shows: 22, then 17, then 13. */
export const MAX_TILES = HOME_FRAMES.desktop.tiles.length;

export function breakpointFor(width: number): HomeBreakpoint {
  if (width >= 1024) return "desktop";
  return width >= 640 ? "tablet" : "mobile";
}

function rules(frame: HomeFrame): string {
  const placed = frame.tiles.map(
    ([x, y, w, h], index) =>
      `.tile-${String(index)}{display:flex;left:${String(Number((spread(x, frame.width) * 100).toFixed(3)))}vw;top:${String(Number((spread(y, frame.height) * 100).toFixed(3)))}svh;width:${String(w)}px}.tile-${String(index)} img{height:${String(h)}px}`,
  );
  const hidden = Array.from({ length: MAX_TILES - frame.tiles.length }, (_unused, extra) => {
    return `.tile-${String(frame.tiles.length + extra)}{display:none}`;
  });
  return [...placed, ...hidden].join("");
}

/** The starting places, as a stylesheet, so the page is right before any script runs. */
export function homeCss(): string {
  return [
    rules(HOME_FRAMES.mobile),
    `@media (min-width:40rem){${rules(HOME_FRAMES.tablet)}}`,
    `@media (min-width:64rem){${rules(HOME_FRAMES.desktop)}}`,
  ].join("");
}

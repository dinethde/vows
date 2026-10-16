/**
 * Where the photographs come to rest in the footer, from the three "state 3"
 * Figma frames: 8 on a desktop, 6 on a tablet, 4 on a phone. Fewer, not
 * smaller. Each is [centre x, centre y, width, height, rotation] with the
 * centre in frame pixels. These are targets; a little randomness is added.
 */
export type Rest = readonly [cx: number, cy: number, w: number, h: number, rotation: number];

export interface FooterFrame {
  width: number;
  height: number;
  photos: readonly Rest[];
}

export const FOOTER_FRAMES = {
  desktop: {
    width: 1440,
    height: 1024,
    photos: [
      [98, 408, 100, 115, 8.5],
      [696, 708, 100, 115, 8.5],
      [1326, 446, 100, 115, 8.5],
      [334, 466, 100, 115, -0.3],
      [1144, 750, 223, 115, -19.1],
      [554, 385, 93, 133, -4.3],
      [894, 382, 230, 133, 0],
      [334, 732, 230, 133, 0],
    ],
  },
  tablet: {
    width: 834,
    height: 1194,
    photos: [
      [90, 552, 100, 115, 8.5],
      [752, 680, 100, 115, -0.3],
      [588, 863, 223, 115, -19.1],
      [278, 542, 93, 133, -4.3],
      [567, 553, 230, 133, 0],
      [202, 829, 230, 133, 0],
    ],
  },
  mobile: {
    width: 390,
    height: 844,
    photos: [
      [61, 434, 70, 81, 8.5],
      [335, 540, 70, 81, -0.3],
      [229, 426, 161, 93, 0],
      [116, 661, 161, 93, 0],
    ],
  },
} as const satisfies Record<string, FooterFrame>;

export const MAX_FOOTER_PHOTOS = FOOTER_FRAMES.desktop.photos.length;

function rules(frame: FooterFrame): string {
  const placed = frame.photos.map(([cx, cy, w, h, rotation], index) => {
    const left = Number(((cx / frame.width) * 100).toFixed(3));
    const top = Number(((cy / frame.height) * 100).toFixed(3));
    return `.fp-${String(index)}{display:block;left:${String(left)}%;top:${String(top)}%;width:${String(w)}px;height:${String(h)}px;--rest:${String(rotation)}deg}`;
  });
  const hidden = Array.from(
    { length: MAX_FOOTER_PHOTOS - frame.photos.length },
    (_unused, extra) => {
      return `.fp-${String(frame.photos.length + extra)}{display:none}`;
    },
  );
  return [...placed, ...hidden].join('');
}

export function footerPhotosCss(): string {
  return [
    rules(FOOTER_FRAMES.mobile),
    `@media (min-width:40rem){${rules(FOOTER_FRAMES.tablet)}}`,
    `@media (min-width:64rem){${rules(FOOTER_FRAMES.desktop)}}`,
  ].join('');
}

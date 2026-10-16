import { FRAMES } from './gallery-layout';
import type { Frame } from './gallery-layout';

/** A frame length as a share of the window's width, so it scales with it. */
function vw(px: number, frame: Frame): string {
  return `${String(Number(((px / frame.width) * 100).toFixed(4)))}vw`;
}

function frameRules(frame: Frame): string {
  const rules = [`.gallery{gap:${vw(frame.gap, frame)};padding-block:${vw(frame.padding, frame)}}`];
  let slot = 0;
  for (const [index, band] of frame.bands.entries()) {
    const first = band[0];
    const second = band[1];
    const gap = first && second ? second.x - (first.x + first.w) : 0;
    const height = Math.max(...band.map((item) => item.h));
    rules.push(
      `.band-${String(index + 1)}{padding-inline-start:${vw(first?.x ?? 0, frame)};gap:${vw(gap, frame)};height:${vw(height, frame)}}`,
    );
    for (const item of band) {
      slot += 1;
      rules.push(
        `.slot-${String(slot)}{width:${vw(item.w, frame)};height:${vw(item.h, frame)};top:${vw(item.y, frame)}}`,
      );
    }
  }
  return rules.join('');
}

/**
 * The stylesheet for the gallery, written from the layout table: one set of
 * numbers per drawn width, switching where the rest of the site switches.
 */
export function galleryCss(): string {
  return [
    frameRules(FRAMES.mobile),
    `@media (min-width:40rem){${frameRules(FRAMES.tablet)}}`,
    `@media (min-width:64rem){${frameRules(FRAMES.desktop)}}`,
  ].join('');
}

/** The width a photograph is drawn at, per breakpoint, for the browser's file choice. */
export function sizesFor(slot: number): string {
  const widthIn = (frame: Frame): string =>
    vw(frame.bands.flat()[slot - 1]?.w ?? frame.width, frame);
  return `(min-width: 64rem) ${widthIn(FRAMES.desktop)}, (min-width: 40rem) ${widthIn(FRAMES.tablet)}, ${widthIn(FRAMES.mobile)}`;
}

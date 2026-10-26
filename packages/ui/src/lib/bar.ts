/* The `bar_backdrop` layer of the three site bars. Figma draws a near-clear
 * wash with a background blur, then blurs the layer itself by 40 so it has no
 * edge. A browser will not feather a backdrop blur that way, so the 80px the
 * layer blur spreads over is a mask that fades the backdrop out instead.
 *
 * It sits at -z-10 inside a bar that isolates, because a flex or grid item
 * with an `order` would otherwise be painted underneath it. */
const wash = "pointer-events-none absolute inset-x-0 -z-10 bg-surface-light/10 backdrop-blur-nav";

/** Under the navbar: from above the bar to 48 below it, fading downwards. */
export const navBackdrop = `${wash} -top-space-8 -bottom-space-9 [mask-image:linear-gradient(to_top,transparent,black_80px)]`;

/** Under a bottom bar: from 40 above the bar to its foot, fading upwards. */
export const bottomBackdrop = `${wash} -top-space-8 bottom-0 [mask-image:linear-gradient(to_bottom,transparent,black_80px)]`;

/**
 * Under the album bar, as redrawn in Figma `2289:7026` (QA round 1): a frosted
 * shape wider than the window with a fully rounded top, starting at the top of
 * the bar — 1684 wide on a desktop, 1082 on a tablet, 638 on a phone, 218
 * tall, its edge blurred by 50. The edge is a mask, as above, over 100px.
 */
export const albumBackdrop = [
  "pointer-events-none absolute left-1/2 top-0 -z-10 h-[max(100%,218px)] -translate-x-1/2",
  "w-[638px] tablet:-top-[27px] tablet:w-[1082px] desktop:top-0 desktop:w-[1684px]",
  "rounded-t-[1000px] bg-surface-light/10 backdrop-blur-nav",
  "[mask-image:linear-gradient(to_bottom,transparent,black_100px)]",
].join(" ");

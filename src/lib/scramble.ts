/**
 * The loading screen's text machine (DESIGN.md §11).
 *
 * Two passes over a fixed string, both pure functions of elapsed time, so the
 * whole animation is a `render(t)` with no internal state to drift:
 *
 *   decode — the string holds its final character count from the first frame
 *            and resolves left to right; the unresolved tail cycles symbols.
 *   erase  — the string is deleted from its tail backwards while the leading
 *            edge of what is left scrambles, so the line shortens as it goes.
 *
 * Spaces are never replaced. Keeping the word gaps means the line's *width*
 * barely moves while it resolves, which is the point of holding the character
 * count in a proportional face like Inter or Mate.
 */

/** The glyphs the unresolved characters cycle through. */
export const SYMBOLS = "!@#$%^&*+=?".split("");

/**
 * A cheap deterministic hash, so a given (index, step) always picks the same
 * glyph. Without it every re-render would re-roll every character and the tail
 * would boil far faster than the cycle rate asks for.
 */
function glyphFor(index: number, step: number) {
  const h = Math.imul(index + 1, 2654435761) ^ Math.imul(step + 1, 40503);
  return SYMBOLS[Math.abs(h) % SYMBOLS.length]!;
}

export type ScrambleOptions = {
  /** Characters resolved per second. */
  rate: number;
  /** Seconds between re-rolls of the unresolved tail. */
  cycle: number;
};

/** Seconds the decode pass needs for a string of this length. */
export function decodeDuration(text: string, rate: number) {
  return text.length / rate;
}

/**
 * Decode: `elapsed` seconds into the pass. Returns the string to paint.
 */
export function decodeAt(
  text: string,
  elapsed: number,
  { rate, cycle }: ScrambleOptions,
) {
  const resolved = Math.max(
    0,
    Math.min(text.length, Math.floor(elapsed * rate)),
  );
  if (resolved >= text.length) return text;

  const step = Math.floor(elapsed / cycle);
  let out = text.slice(0, resolved);
  for (let i = resolved; i < text.length; i += 1) {
    out += text[i] === " " ? " " : glyphFor(i, step);
  }
  return out;
}

/**
 * Erase: `progress` runs 0 → 1 across the pass. The line shortens from the
 * end, and the last few surviving characters scramble.
 */
export function eraseAt(
  text: string,
  progress: number,
  { cycle }: ScrambleOptions,
  edge: number,
  elapsed: number,
) {
  const remaining = Math.max(
    0,
    Math.min(text.length, Math.ceil(text.length * (1 - progress))),
  );
  if (remaining === 0) return "";

  const step = Math.floor(elapsed / cycle);
  const solid = Math.max(0, remaining - edge);
  let out = text.slice(0, solid);
  for (let i = solid; i < remaining; i += 1) {
    out += text[i] === " " ? " " : glyphFor(i, step);
  }
  return out;
}

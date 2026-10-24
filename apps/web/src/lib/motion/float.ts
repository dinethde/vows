/**
 * The quiet movement every photograph on the site shares: a slow drift on its
 * own, and a lean in the direction the pointer is travelling, strongest near
 * the pointer. One set of numbers, so the home page, the album and the footer
 * all feel the same.
 */
export const FLOAT = {
  /** How far a photograph drifts on its own, in pixels. */
  amplitude: 5,
  /** How long one drift takes, in milliseconds. */
  period: 9000,
  /** How far from the pointer a photograph still reacts. */
  reach: 320,
  /** How much of the pointer's travel a photograph next to it picks up. */
  strength: 0.22,
  /** The most a photograph can be pushed. */
  limit: 28,
  /** How much of the push is left after each frame. */
  decay: 0.93,
} as const;

export interface Point {
  x: number;
  y: number;
}

/** A slow figure that never quite repeats, different for each photograph. */
export function drift(time: number, seed: number): Point {
  const angle = (time / FLOAT.period) * Math.PI * 2;
  return {
    x: Math.sin(angle + seed * 1.7) * FLOAT.amplitude,
    y: Math.cos(angle * 0.8 + seed * 2.3) * FLOAT.amplitude,
  };
}

/** 1 under the pointer, falling to 0 at the edge of its reach. */
export function falloff(distance: number): number {
  const near = Math.max(0, 1 - distance / FLOAT.reach);
  return near * near;
}

/** Adds the pointer's travel to a push, weighted by distance, and keeps it bounded. */
export function nudge(push: Point, travel: Point, distance: number): Point {
  const weight = falloff(distance) * FLOAT.strength;
  const clamp = (value: number): number => Math.max(-FLOAT.limit, Math.min(FLOAT.limit, value));
  return { x: clamp(push.x + travel.x * weight), y: clamp(push.y + travel.y * weight) };
}

/**
 * The second movement, added in QA round 1: every photograph follows where the
 * pointer is, not only the ones it passes. With the pointer at the left edge
 * the whole field sits a little to the left; at the bottom, a little lower.
 * Each photograph moves by its own depth, so the field reads as layers.
 */
export const FOLLOW = {
  /** How far the field moves with the pointer at the edge of the window. */
  reach: 16,
  /** How much of the remaining way the field covers each frame. */
  ease: 0.06,
} as const;

/** Where the field should sit for a pointer at `pointer` in a window of `size`. */
export function followTarget(pointer: Point, size: Point): Point {
  const unit = (value: number, length: number): number =>
    length > 0 ? Math.max(-1, Math.min(1, (value / length) * 2 - 1)) : 0;
  return { x: unit(pointer.x, size.x) * FOLLOW.reach, y: unit(pointer.y, size.y) * FOLLOW.reach };
}

/** One frame closer to `target`, so the field glides rather than jumps. */
export function approach(current: Point, target: Point): Point {
  return {
    x: current.x + (target.x - current.x) * FOLLOW.ease,
    y: current.y + (target.y - current.y) * FOLLOW.ease,
  };
}

/** How strongly one photograph follows: between 0.6 and 1.4, fixed per photograph. */
export function depth(seed: number): number {
  return 1 + Math.sin(seed * 12.9898) * 0.4;
}

export function settle(push: Point): Point {
  return { x: push.x * FLOAT.decay, y: push.y * FLOAT.decay };
}

/** Where a value lands when the canvas wraps: always inside one cell starting at `start`. */
export function wrap(value: number, start: number, size: number): number {
  return ((((value - start) % size) + size) % size) + start;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

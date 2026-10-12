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

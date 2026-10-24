import { describe, expect, it } from 'vitest';

import {
  approach,
  depth,
  drift,
  falloff,
  FLOAT,
  FOLLOW,
  followTarget,
  nudge,
  settle,
  wrap,
} from './float';

describe('the float', () => {
  it('drifts by a few pixels and never further', () => {
    for (let time = 0; time < 60_000; time += 777) {
      const point = drift(time, 3);
      expect(Math.abs(point.x)).toBeLessThanOrEqual(FLOAT.amplitude);
      expect(Math.abs(point.y)).toBeLessThanOrEqual(FLOAT.amplitude);
    }
  });

  it('reacts fully under the pointer and not at all beyond its reach', () => {
    expect(falloff(0)).toBe(1);
    expect(falloff(FLOAT.reach)).toBe(0);
    expect(falloff(FLOAT.reach * 3)).toBe(0);
  });

  it('pushes a photograph the way the pointer is travelling, and caps the push', () => {
    const pushed = nudge({ x: 0, y: 0 }, { x: 40, y: 0 }, 0);
    expect(pushed.x).toBeGreaterThan(0);
    expect(pushed.y).toBe(0);
    expect(nudge({ x: 0, y: 0 }, { x: 100_000, y: 0 }, 0).x).toBe(FLOAT.limit);
  });

  it('eases back to rest when the pointer stops', () => {
    let push = { x: 20, y: -20 };
    for (let frame = 0; frame < 200; frame += 1) push = settle(push);
    expect(Math.abs(push.x)).toBeLessThan(0.01);
  });
});

describe('wrap', () => {
  it('brings a tile that left one side back in on the other, with no seam', () => {
    expect(wrap(1700, -230, 1900)).toBe(-200);
    expect(wrap(-240, -230, 1900)).toBe(1660);
    expect(wrap(500, -230, 1900)).toBe(500);
  });
});

describe('the whole field following the pointer', () => {
  const size = { x: 1000, y: 800 };

  it('sits to the left with the pointer on the left, and lower with it at the bottom', () => {
    expect(followTarget({ x: 0, y: 400 }, size)).toEqual({ x: -FOLLOW.reach, y: 0 });
    expect(followTarget({ x: 1000, y: 800 }, size)).toEqual({ x: FOLLOW.reach, y: FOLLOW.reach });
    expect(followTarget({ x: 500, y: 400 }, size)).toEqual({ x: 0, y: 0 });
  });

  it('never goes further than its reach, even outside the window', () => {
    expect(followTarget({ x: -300, y: 2000 }, size)).toEqual({ x: -FOLLOW.reach, y: FOLLOW.reach });
  });

  it('glides towards where it should be, and arrives', () => {
    let at = { x: 0, y: 0 };
    const target = { x: 10, y: -10 };
    at = approach(at, target);
    expect(at.x).toBeGreaterThan(0);
    expect(at.x).toBeLessThan(10);
    for (let frame = 0; frame < 300; frame += 1) at = approach(at, target);
    expect(at.x).toBeCloseTo(10, 3);
    expect(at.y).toBeCloseTo(-10, 3);
  });

  it('gives each photograph its own depth, between 0.6 and 1.4', () => {
    const depths = [1, 2, 3, 4, 5, 6].map(depth);
    for (const value of depths) {
      expect(value).toBeGreaterThanOrEqual(0.6);
      expect(value).toBeLessThanOrEqual(1.4);
    }
    expect(new Set(depths.map((value) => value.toFixed(2))).size).toBeGreaterThan(3);
  });
});

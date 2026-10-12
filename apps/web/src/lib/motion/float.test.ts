import { describe, expect, it } from 'vitest';

import { drift, falloff, FLOAT, nudge, settle, wrap } from './float';

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

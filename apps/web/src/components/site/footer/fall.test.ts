import { describe, expect, it } from 'vitest';

import { fallKeyframes, staggers } from './fall';
import { FOOTER_FRAMES } from './footer-photos-layout';

function heights(frames: Keyframe[]): number[] {
  return frames.map((frame) =>
    Number(/\+ (-?[\d.]+)px/.exec(String(frame.transform))?.[1] ?? 'NaN'),
  );
}

describe('the fall', () => {
  it('starts above the footer and ends at rest', () => {
    const ys = heights(fallKeyframes(600, '8.5deg'));
    expect(ys[0]).toBe(-600);
    expect(ys.at(-1)).toBe(0);
  });

  it('bounces three times, each about 45 per cent of the one before', () => {
    const peaks = heights(fallKeyframes(600, '0deg'))
      .slice(1)
      .filter((y) => y < 0);
    expect(peaks).toHaveLength(3);
    expect((peaks[1] ?? 0) / (peaks[0] ?? 1)).toBeCloseTo(0.45, 1);
    expect((peaks[2] ?? 0) / (peaks[1] ?? 1)).toBeCloseTo(0.45, 1);
  });

  it('keeps its offsets in order, which the browser requires', () => {
    const offsets = fallKeyframes(600, '0deg').map((frame) => frame.offset ?? 0);
    expect([...offsets].sort((a, b) => a - b)).toEqual(offsets);
    expect(offsets.at(-1)).toBe(1);
  });

  it('drops the photographs 80 to 140 ms apart, not all at once', () => {
    const delays = [...staggers(8)].sort((a, b) => a - b);
    for (let index = 1; index < delays.length; index += 1) {
      const gap = (delays[index] ?? 0) - (delays[index - 1] ?? 0);
      expect(gap).toBeGreaterThanOrEqual(80);
      expect(gap).toBeLessThanOrEqual(140);
    }
  });
});

describe('the footer photographs', () => {
  it('are fewer on a smaller screen, not smaller: 8, 6, 4', () => {
    expect(FOOTER_FRAMES.desktop.photos).toHaveLength(8);
    expect(FOOTER_FRAMES.tablet.photos).toHaveLength(6);
    expect(FOOTER_FRAMES.mobile.photos).toHaveLength(4);
  });
});

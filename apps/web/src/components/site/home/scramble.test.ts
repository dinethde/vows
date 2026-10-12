import { describe, expect, it } from 'vitest';

import { scramble } from './scramble';

const TEXT = 'VOWS Weddings';
const first = (): number => 0;

describe('scramble', () => {
  it('keeps the full length from the first frame, so nothing reflows', () => {
    for (const progress of [0, 0.3, 0.7, 1])
      expect(scramble(TEXT, 'in', progress, first)).toHaveLength(TEXT.length);
  });

  it('resolves left to right, and ends on the real words', () => {
    expect(scramble(TEXT, 'in', 0.5, first).slice(0, 6)).toBe('VOWS W');
    expect(scramble(TEXT, 'in', 0.5, first).slice(6)).not.toContain('d');
    expect(scramble(TEXT, 'in', 1, first)).toBe(TEXT);
  });

  it('holds still when resolved', () => {
    expect(scramble(TEXT, 'hold', 0.4)).toBe(TEXT);
  });

  it('is deleted from the tail on the way out, down to nothing', () => {
    expect(scramble(TEXT, 'out', 0.5, first).length).toBeLessThan(TEXT.length);
    expect(scramble(TEXT, 'out', 0.5, first).startsWith('VOW')).toBe(true);
    expect(scramble(TEXT, 'out', 1, first)).toBe('');
  });

  it('never scrambles a space, so the words keep their shape', () => {
    expect(scramble(TEXT, 'in', 0, first)[4]).toBe(' ');
  });
});

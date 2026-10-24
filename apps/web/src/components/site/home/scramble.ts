const SYMBOLS = '!<>-_\\/[]{}—=+*^?#';

export type Phase = 'in' | 'hold' | 'out';

/**
 * One frame of the decode. `progress` runs 0 to 1. Coming in, the line keeps
 * its full length and resolves from the left, the rest cycling through
 * symbols. Going out, it is deleted from the tail while its front edge
 * scrambles again. `pick` chooses a symbol, so a test can make it predictable.
 */
export function scramble(
  text: string,
  phase: Phase,
  progress: number,
  pick: () => number = Math.random,
): string {
  if (phase === 'hold') return text;
  const symbol = (): string => SYMBOLS[Math.floor(pick() * SYMBOLS.length)] ?? '-';
  const keep = (char: string, noisy: boolean): string =>
    char === ' ' ? ' ' : noisy ? symbol() : char;

  if (phase === 'in') {
    const resolved = Math.floor(text.length * Math.min(1, Math.max(0, progress)));
    return [...text].map((char, index) => keep(char, index >= resolved)).join('');
  }
  const left = Math.ceil(text.length * (1 - Math.min(1, Math.max(0, progress))));
  const noisyFrom = Math.max(0, left - 3);
  return [...text.slice(0, left)].map((char, index) => keep(char, index >= noisyFrom)).join('');
}

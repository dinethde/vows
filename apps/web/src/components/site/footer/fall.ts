/**
 * A photograph dropping in from above, bouncing three times, each bounce about
 * 45 per cent of the one before, then coming to rest. Transform only.
 */
const FIRST_BOUNCE = 64;
const RESTITUTION = 0.45;
const BOUNCES = 3;
export const FALL_MS = 1500;

export function fallKeyframes(dropFrom: number, rotation: string): Keyframe[] {
  const at = (y: number, offset: number, easing: string, turn = rotation): Keyframe => ({
    transform: `translate3d(-50%, calc(-50% + ${y.toFixed(1)}px), 0) rotate(${turn})`,
    offset,
    easing,
  });
  const frames = [
    {
      ...at(-dropFrom, 0, 'cubic-bezier(0.55, 0, 1, 0.45)', `calc(${rotation} - 14deg)`),
      opacity: 1,
    },
    at(0, 0.46, 'cubic-bezier(0, 0.55, 0.45, 1)'),
  ];
  // Each bounce is shorter in time as well as height, the way a real one is.
  let height = FIRST_BOUNCE;
  let offset = 0.46;
  let span = 0.24;
  for (let bounce = 0; bounce < BOUNCES; bounce += 1) {
    frames.push(at(-height, offset + span / 2, 'cubic-bezier(0.55, 0, 1, 0.45)'));
    frames.push(at(0, offset + span, 'cubic-bezier(0, 0.55, 0.45, 1)'));
    offset += span;
    span *= 0.62;
    height *= RESTITUTION;
  }
  frames.push(at(0, 1, 'linear'));
  return frames;
}

/** 80 to 140 ms apart, in a shuffled order, so it never reads as a row falling together. */
export function staggers(count: number, random: () => number = Math.random): number[] {
  const order = Array.from({ length: count }, (_unused, index) => index).sort(() => random() - 0.5);
  const delays = new Array<number>(count).fill(0);
  let delay = 0;
  for (const index of order) {
    delays[index] = delay;
    delay += 80 + random() * 60;
  }
  return delays;
}

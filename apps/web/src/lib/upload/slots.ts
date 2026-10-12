import { GALLERY_SIZE } from '@vows/contracts';

export interface SlotPlan {
  /** The slot each file goes to, in the order the files were given. */
  positions: number[];
  /** How many files had nowhere to go. They are the last ones. */
  overflow: number;
}

function emptyFrom(start: number, taken: ReadonlySet<number>): number[] {
  const order = Array.from({ length: GALLERY_SIZE }, (_, index) => {
    return ((start - 1 + index) % GALLERY_SIZE) + 1;
  });
  return order.filter((position) => !taken.has(position));
}

/**
 * Where a batch of files lands. The first goes into the slot it was dropped
 * on, replacing whatever is there. The rest fill the next empty gallery slots
 * in order, going round to slot 1 after slot 18. The cover is only ever filled
 * by a file put on the cover itself.
 */
export function planSlots(target: number, count: number, taken: ReadonlySet<number>): SlotPlan {
  if (count <= 0) return { positions: [], overflow: 0 };
  const after = new Set(taken).add(target);
  const rest = emptyFrom(target + 1 > GALLERY_SIZE ? 1 : target + 1, after).slice(0, count - 1);
  const positions = [target, ...rest];
  return { positions, overflow: count - positions.length };
}

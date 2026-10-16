import type { UploadQueue } from './queue';
import { planSlots } from './slots';
import { refusal } from './validate';

export interface Drop {
  albumId: string;
  /** The slot the files were chosen for or dropped on. 0 is the cover. */
  target: number;
  files: File[];
  /** Slots that already hold a photograph or have one on its way. */
  taken: ReadonlySet<number>;
}

/**
 * Takes what was dropped on a slot and starts what can be started. A file of
 * the wrong type or size is named and left out; it does not use up a slot.
 * Files with nowhere to go are named too, so nothing disappears quietly.
 */
export function placeFiles(queue: UploadQueue, { albumId, target, files, taken }: Drop): void {
  if (files.length === 0) return;
  queue.clearRejections(albumId);

  const refused = files.flatMap((file) => refusal(file) ?? []);
  const good = files.filter((file) => refusal(file) === null);
  const plan = planSlots(target, good.length, taken);
  const placed = plan.positions.flatMap((position, index) => {
    const file = good[index];
    return file ? [{ file, position }] : [];
  });
  const homeless = good
    .slice(placed.length)
    .map((file) => `There is no empty slot left for ${file.name}.`);

  queue.add(albumId, placed);
  if (refused.length + homeless.length > 0) queue.reject(albumId, [...refused, ...homeless]);
}

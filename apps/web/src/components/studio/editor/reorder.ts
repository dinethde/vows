import { COVER_POSITION, GALLERY_SIZE } from '@vows/contracts';
import type { Photo } from '@vows/contracts';

export interface Reordered {
  /** The album's photographs with the two positions exchanged. */
  photos: Photo[];
  /** What the API wants: index 0 is slot 1, null is an empty slot. */
  slots: (string | null)[];
}

export function canMove(from: number, to: number): boolean {
  return from > COVER_POSITION && to > COVER_POSITION && to <= GALLERY_SIZE && from !== to;
}

/**
 * Moves the photograph in one gallery slot to another. Whatever was there
 * takes its old place, so nothing else shifts: a move into an empty slot
 * leaves an empty slot behind. The cover is not part of the order.
 */
export function movePhoto(photos: Photo[], from: number, to: number): Reordered | null {
  if (!canMove(from, to) || !photos.some((photo) => photo.position === from)) return null;

  const moved = photos.map((photo) => {
    if (photo.position === from) return { ...photo, position: to };
    if (photo.position === to) return { ...photo, position: from };
    return photo;
  });
  const bySlot = new Map(moved.map((photo) => [photo.position, photo.id]));
  const slots = Array.from({ length: GALLERY_SIZE }, (_, index) => bySlot.get(index + 1) ?? null);
  return { photos: moved.sort((a, b) => a.position - b.position), slots };
}

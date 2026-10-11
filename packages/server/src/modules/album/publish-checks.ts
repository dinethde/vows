import { COVER_POSITION, GALLERY_SIZE } from '@vows/contracts';
import type { PublishProblem } from '@vows/contracts';

export interface PublishableAlbum {
  coupleNames: string | null;
  shotOn: string | null;
  coverPhotoId: string | null;
}

export interface PublishablePhoto {
  id: string;
  position: number;
  status: string;
  alt: string | null;
}

function slotProblems(slot: PublishablePhoto | undefined, position: number): PublishProblem[] {
  if (!slot) return [{ problem: 'missing_photo', position }];
  if (slot.status !== 'ready') return [{ problem: 'photo_not_ready', position }];
  if (!slot.alt?.trim()) return [{ problem: 'missing_alt', position }];
  return [];
}

/**
 * Everything that stops an album going out, all at once, so the photographer
 * fixes them in one pass. An empty list means it may be published.
 */
export function publishProblems(
  album: PublishableAlbum,
  photos: PublishablePhoto[],
): PublishProblem[] {
  const problems: PublishProblem[] = [];
  if (!album.coupleNames?.trim())
    problems.push({ problem: 'missing_couple_names', position: null });
  if (!album.shotOn) problems.push({ problem: 'missing_shot_on', position: null });

  const cover = photos.find((photo) => photo.position === COVER_POSITION);
  if (!cover || cover.id !== album.coverPhotoId) {
    problems.push({ problem: 'missing_cover', position: COVER_POSITION });
  } else {
    problems.push(...slotProblems(cover, COVER_POSITION));
  }

  for (let position = 1; position <= GALLERY_SIZE; position += 1) {
    problems.push(
      ...slotProblems(
        photos.find((photo) => photo.position === position),
        position,
      ),
    );
  }
  return problems;
}

const SENTENCES: Record<PublishProblem['problem'], (position: number | null) => string> = {
  missing_couple_names: () => 'Add the couple’s names. Every album needs a title.',
  missing_shot_on: () => 'Add the wedding date.',
  missing_cover: () => 'Add a cover photograph.',
  missing_photo: (position) => `Slot ${String(position)} is empty. Add a photograph.`,
  photo_not_ready: (position) =>
    position === COVER_POSITION
      ? 'The cover photograph has not finished uploading.'
      : `The photograph in slot ${String(position)} has not finished uploading.`,
  missing_alt: (position) =>
    position === COVER_POSITION
      ? 'Describe the cover photograph.'
      : `Describe the photograph in slot ${String(position)}.`,
};

const FIELDS: Record<PublishProblem['problem'], (position: number | null) => string> = {
  missing_couple_names: () => 'coupleNames',
  missing_shot_on: () => 'shotOn',
  missing_cover: () => 'cover',
  missing_photo: (position) => `photos.${String(position)}`,
  photo_not_ready: (position) => `photos.${String(position)}`,
  missing_alt: (position) => `photos.${String(position)}.alt`,
};

/** The field map for the 422: which thing, and what to do about it. */
export function problemFields(problems: PublishProblem[]): Record<string, string> {
  return Object.fromEntries(
    problems.map(({ problem, position }) => [
      FIELDS[problem](position),
      SENTENCES[problem](position),
    ]),
  );
}

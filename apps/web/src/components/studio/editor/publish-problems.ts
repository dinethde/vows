import { COVER_POSITION, GALLERY_SIZE } from '@vows/contracts';
import type { Photo } from '@vows/contracts';

import { parseDateText } from '@/components/shared/date/date-text';

/**
 * Why an album cannot go out, keyed the way the API keys its 422:
 * `coupleNames`, `shotOn`, `cover`, `photos.7`, `photos.7.alt`. The value is
 * the sentence to show beside the thing that is wrong.
 */
export type Problems = Record<string, string>;

export interface PublishInput {
  coupleNames: string;
  shotOn: string;
  /** Every photograph the album holds, the cover included. */
  photos: Photo[];
  /** Slots with a file still on its way from this browser. */
  uploading: ReadonlySet<number>;
}

function slotName(position: number): string {
  return position === COVER_POSITION
    ? 'The cover photograph'
    : `The photograph in slot ${String(position)}`;
}

function describe(position: number): string {
  return position === COVER_POSITION
    ? 'Describe the cover photograph.'
    : `Describe the photograph in slot ${String(position)}.`;
}

function slotProblem(
  position: number,
  photo: Photo | undefined,
  uploading: boolean,
): [string, string] | null {
  const key = `photos.${String(position)}`;
  if (uploading || (photo && photo.status !== 'ready')) {
    return [key, `${slotName(position)} has not finished uploading.`];
  }
  if (!photo) {
    return position === COVER_POSITION
      ? ['cover', 'Add a cover photograph.']
      : [key, `Slot ${String(position)} is empty. Add a photograph.`];
  }
  return photo.alt?.trim() ? null : [`${key}.alt`, describe(position)];
}

/**
 * The same checks the API makes before it publishes, made here first so the
 * photographer is told before the request is sent. The API still decides: this
 * is only what the browser can already see. The order is the order on screen.
 */
export function findProblems({ coupleNames, shotOn, photos, uploading }: PublishInput): Problems {
  const problems: Problems = {};
  if (!coupleNames.trim()) {
    problems.coupleNames = 'Add the couple’s names. Every album needs a title.';
  }
  if (!shotOn.trim() || parseDateText(shotOn) === null) problems.shotOn = 'Add the wedding date.';

  const bySlot = new Map(photos.map((photo) => [photo.position, photo]));
  for (let position = COVER_POSITION; position <= GALLERY_SIZE; position += 1) {
    const found = slotProblem(position, bySlot.get(position), uploading.has(position));
    if (found) problems[found[0]] = found[1];
  }
  return problems;
}

/** "2 things need fixing before this album can go live." */
export function problemSummary(count: number): string {
  const things = count === 1 ? '1 thing needs' : `${String(count)} things need`;
  return `${things} fixing before this album can go live.`;
}

/** The line beside the faded Publish button, which is also what it is described by. */
export function blockedNote(count: number): string {
  if (count === 1) return 'Publishing is blocked until this one thing is fixed.';
  if (count === 2) return 'Publishing is blocked until both things are fixed.';
  return `Publishing is blocked until all ${String(count)} things are fixed.`;
}

/** What a slot has wrong with it, and what its description has wrong with it. */
export function slotProblems(
  problems: Problems,
  position: number,
): { slot: string | undefined; alt: string | undefined } {
  const key = `photos.${String(position)}`;
  const cover = position === COVER_POSITION ? problems.cover : undefined;
  return { slot: problems[key] ?? cover, alt: problems[`${key}.alt`] };
}

/** The key whose control focus should move to when a slot is the first problem. */
export function problemKeyForSlot(position: number, alt: boolean): string {
  return `photos.${String(position)}${alt ? '.alt' : ''}`;
}

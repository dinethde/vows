import type { Photo } from '@vows/contracts';
import { thumbHashToDataURL } from 'thumbhash';

export interface Thumb {
  /** A small derivative, never the original. Undefined until the worker has made one. */
  src: string | undefined;
  /** The ThumbHash as a data URL, shown until `src` has loaded. */
  placeholderSrc: string | undefined;
}

function placeholder(thumbhash: string | null): string | undefined {
  if (!thumbhash) return undefined;
  try {
    const bytes = Uint8Array.from(atob(thumbhash), (char) => char.charCodeAt(0));
    return thumbHashToDataURL(bytes);
  } catch {
    return undefined;
  }
}

/**
 * The picture for a slot or a card: the smallest WebP that is at least as wide
 * as the box, so a 240-wide card does not download a 2400-wide file.
 */
export function thumbFor(photo: Photo, boxWidth: number): Thumb {
  const webp = photo.derivatives
    .filter((file) => file.format === 'webp')
    .sort((a, b) => a.width - b.width);
  const fit = webp.find((file) => file.width >= boxWidth) ?? webp.at(-1);
  return { src: fit?.url, placeholderSrc: placeholder(photo.thumbhash) };
}

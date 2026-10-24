import type { StaticImageData } from 'next/image';
import type { ReactElement } from 'react';

import forbiddenStill from '@/assets/gifs/403.gif';
import notFoundStill from '@/assets/gifs/404-still.webp';
import notFound from '@/assets/gifs/404.webp';
import serverErrorStill from '@/assets/gifs/500-still.webp';
import serverError from '@/assets/gifs/500.webp';

interface Clip {
  moving: StaticImageData;
  still: StaticImageData;
}

/**
 * The picture in each error page's print (Figma `2448:1964`, QA round 2): a
 * short animation, its first frame for anyone who asks for less motion. Served
 * as they are: an optimiser would flatten the animation to one frame. The
 * 403 file has a single frame, so it is its own still.
 */
const CLIPS: Record<'404' | '500' | '403', Clip> = {
  '404': { moving: notFound, still: notFoundStill },
  '500': { moving: serverError, still: serverErrorStill },
  '403': { moving: forbiddenStill, still: forbiddenStill },
};

export interface ErrorPictureProps {
  code: keyof typeof CLIPS;
}

/** Decoration, like the card it sits in: no description, never focused. */
export function ErrorPicture({ code }: ErrorPictureProps): ReactElement {
  const { moving, still } = CLIPS[code];
  return (
    <picture>
      <source media="(prefers-reduced-motion: reduce)" srcSet={still.src} />
      {/* A plain img: next/image would stop the animation. */}
      <img src={moving.src} width={moving.width} height={moving.height} alt="" decoding="async" />
    </picture>
  );
}

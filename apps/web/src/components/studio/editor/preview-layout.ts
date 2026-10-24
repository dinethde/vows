import type { CSSProperties } from 'react';

import { FRAMES } from '@/components/site/album/gallery-layout';

/*
 * The preview draws the album page's desktop frame inside a narrower column.
 * The public page turns frame pixels into a share of the window; the preview
 * turns the same pixels into a share of its own width (`cqw`), so it is the
 * real layout at a smaller scale and never overflows. The numbers themselves
 * stay in one place: the public gallery's layout file.
 */
const FRAME = FRAMES.desktop;

/** A frame pixel as a share of the preview's width. */
export function scaled(pixels: number): string {
  return `${((pixels / FRAME.width) * 100).toFixed(4)}cqw`;
}

export interface PreviewSlot {
  position: number;
  /** Where the box sits inside its band, and how large it is. */
  style: CSSProperties;
  /** The box's width in frame pixels, for choosing a picture file. */
  width: number;
}

export interface PreviewBand {
  key: string;
  style: CSSProperties;
  slots: PreviewSlot[];
}

/** The 13 bands and their 18 slots, numbered in reading order. */
export function previewBands(): PreviewBand[] {
  let position = 0;
  return FRAME.bands.map((band, index) => ({
    key: `band-${String(index + 1)}`,
    style: { height: scaled(Math.max(...band.map((box) => box.h))) },
    slots: band.map((box) => {
      position += 1;
      return {
        position,
        width: box.w,
        style: {
          left: scaled(box.x),
          top: scaled(box.y),
          width: scaled(box.w),
          height: scaled(box.h),
        },
      };
    }),
  }));
}

/** Room above the first band and below the last, and between one band and the next. */
export const galleryStyle: CSSProperties = {
  paddingBlock: scaled(FRAME.padding),
  gap: scaled(FRAME.gap),
};

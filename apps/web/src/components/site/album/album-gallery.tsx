import type { Photo as PhotoData } from '@vows/contracts';
import type { ReactElement } from 'react';

import { galleryCss, sizesFor } from './gallery-css';
import { BAND_SIZES } from './gallery-layout';

import { Photo } from '@/components/site/photo/photo';

export interface AlbumGalleryProps {
  /** The eighteen photographs, in slot order. */
  photos: PhotoData[];
}

/**
 * One photograph at a time, with room to breathe. An ordered list of bands, so
 * the reading order is the order on the page. Every box has its size before
 * its picture arrives; the gallery clips, a band does not, which is what lets
 * the small photograph in band 7 sit above its band.
 */
export function AlbumGallery({ photos }: AlbumGalleryProps): ReactElement {
  const bySlot = new Map(photos.map((photo) => [photo.position, photo]));
  let slot = 0;
  return (
    <section aria-label="Photographs" className="gallery bg-page flex flex-col overflow-clip">
      <style>{galleryCss()}</style>
      {BAND_SIZES.map((size, index) => (
        <div
          key={`band-${String(index + 1)}`}
          className={`band-${String(index + 1)} flex items-start`}
        >
          {Array.from({ length: size }, () => {
            slot += 1;
            const photo = bySlot.get(slot);
            return (
              <div
                key={`slot-${String(slot)}`}
                className={`slot-${String(slot)} relative shrink-0`}
              >
                {photo ? (
                  <Photo photo={photo} sizes={sizesFor(slot)} className="size-full object-cover" />
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}

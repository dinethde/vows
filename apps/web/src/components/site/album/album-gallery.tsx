import type { ReactElement } from "react";

import type { Photo as PhotoData } from "@vows/contracts";
import { FloatGroup } from "@/components/site/motion/float-group";
import { Photo } from "@/components/site/photo/photo";

import { galleryCss, sizesFor } from "./gallery-css";
import { BAND_SIZES } from "./gallery-layout";

export interface AlbumGalleryProps {
  /** The eighteen photographs, in slot order. */
  photos: PhotoData[];
}

interface SlotProps {
  slot: number;
  photo: PhotoData | undefined;
}

/** The outer box arrives once; the inner one floats. Two elements, so the two never fight over a transform. */
function Slot({ slot, photo }: SlotProps): ReactElement {
  return (
    <div data-reveal className={`slot-${String(slot)} relative shrink-0`}>
      <div data-float className="size-full will-change-transform">
        {photo ? (
          <Photo photo={photo} sizes={sizesFor(slot)} className="size-full object-cover" />
        ) : null}
      </div>
    </div>
  );
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
    <section aria-label="Photographs" className="bg-page overflow-clip">
      <style>{galleryCss()}</style>
      <FloatGroup className="gallery flex flex-col">
        {BAND_SIZES.map((size, index) => (
          <div
            key={`band-${String(index + 1)}`}
            className={`band-${String(index + 1)} flex items-start`}
          >
            {Array.from({ length: size }, () => {
              slot += 1;
              return <Slot key={`slot-${String(slot)}`} slot={slot} photo={bySlot.get(slot)} />;
            })}
          </div>
        ))}
      </FloatGroup>
    </section>
  );
}

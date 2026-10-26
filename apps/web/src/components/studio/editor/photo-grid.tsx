"use client";

import type { ReactElement } from "react";

import { COVER_POSITION, GALLERY_SIZE } from "@vows/contracts";
import { cn } from "@vows/ui";

import { PhotoNotices } from "./photo-notices";
import { SlotCard } from "./slot-card";
import { useSlots } from "./slots-context";

const POSITIONS = Array.from({ length: GALLERY_SIZE }, (_, index) => index + 1);

/* Tall on a phone, where a slot is the width of the screen; near square in the
 * four-across grid of a tablet, the shape of the Figma master (89 × 86). */
const box = "h-[300px] tablet:h-auto tablet:aspect-[89/86]";

/**
 * The edit-first layout, below the desktop width: every slot in a plain grid,
 * one per row on a phone and four on a tablet. It is deliberately not laid out
 * like the album page. Here the only question is which slots are still empty.
 */
export function PhotoGrid(): ReactElement {
  const { photos } = useSlots();
  const done = photos.added === GALLERY_SIZE;

  return (
    <section aria-labelledby="photos-heading" className="flex flex-col gap-[14px]">
      <div className="gap-space-2 flex items-start justify-between">
        <div className="flex flex-col gap-[2px]">
          <h2 id="photos-heading" className="type-heading-6 tablet:type-heading-5 text-heading">
            Photos
          </h2>
          <p className="type-studio-body-s text-placeholder">
            A cover and 18 slots. Every one has to be filled before this album can go live.
          </p>
        </div>
        <p
          className={cn(
            "type-studio-label-l shrink-0 pt-[6px]",
            done ? "text-status-success" : "text-status-warning",
          )}
        >
          {`${String(photos.added)} of ${String(GALLERY_SIZE)} added`}
        </p>
      </div>
      <PhotoNotices />
      <div className="gap-space-5 tablet:grid-cols-4 tablet:gap-space-3 grid grid-cols-1">
        <SlotCard position={COVER_POSITION} thumbWidth={640} boxClassName={box} />
        {POSITIONS.map((position) => (
          <SlotCard key={position} position={position} thumbWidth={640} boxClassName={box} />
        ))}
      </div>
    </section>
  );
}

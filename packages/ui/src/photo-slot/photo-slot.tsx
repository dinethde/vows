"use client";

import type { ReactElement } from "react";

import { cn } from "../lib/cn";
import { DashedEdge } from "./photo-slot-glyphs";
import { slotName } from "./photo-slot-name";
import { Corners, Face, Photo, ReplaceOverlay } from "./photo-slot-parts";
import type { PhotoSlotProps, PhotoSlotState } from "./photo-slot.types";
import { hasPhoto, usePhotoSlot } from "./use-photo-slot";

/* The box is the same size in every state. Nothing inside is in the flow, so
 * the grid cannot jump while a batch uploads. 89 × 86 is the Figma master; a
 * grid cell stretches it. */
const box = "group relative block h-full min-h-[86px] w-full min-w-[89px]";

const surfaces: Record<PhotoSlotState, string> = {
  Empty: "bg-slot",
  Uploading: "border-[1.5px] border-strong bg-slot",
  Uploaded: "border border-hairline bg-field-muted",
  Update: "border border-hairline bg-field-muted",
  Error: "border-[1.5px] border-status-error bg-status-error",
};

const face = cn(
  "absolute inset-0 flex cursor-pointer flex-col items-center justify-center p-space-4",
  "type-studio-label-l outline-none",
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring",
  "aria-disabled:cursor-progress",
);

export function PhotoSlot(props: PhotoSlotProps): ReactElement {
  const { state, accept = "image/*", className } = props;
  const { picker, dragging, press, pick, drag } = usePhotoSlot(props);
  const uploading = state === "Uploading";

  return (
    <div
      className={cn(box, surfaces[state], className)}
      data-state={state}
      onDragEnter={drag}
      onDragOver={drag}
      onDragLeave={drag}
      onDrop={drag}
    >
      {state === "Empty" ? <DashedEdge /> : null}
      <Photo {...props} />
      <button
        type="button"
        className={face}
        aria-label={slotName(props)}
        aria-disabled={uploading || undefined}
        aria-busy={uploading || undefined}
        onClick={press}
      >
        <Face {...props} />
        {hasPhoto(state) || dragging ? (
          <ReplaceOverlay shown={state === "Update" || dragging} />
        ) : null}
      </button>
      <input
        ref={picker}
        type="file"
        accept={accept}
        hidden
        tabIndex={-1}
        aria-hidden="true"
        onChange={pick}
      />
      <Corners {...props} />
    </div>
  );
}

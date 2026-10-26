"use client";

import { useState } from "react";
import type { ChangeEvent, ReactElement } from "react";

import type { Photo } from "@vows/contracts";
import { Field, cn } from "@vows/ui";
import { focusRing } from "@/components/shared/focus";

import { canMove } from "./reorder";
import { useSlots } from "./slots-context";

export interface SlotCaptionProps {
  photo: Photo;
  /** What publishing found wrong with the description, if anything. */
  problem: string | undefined;
}

export interface MoveButtonProps {
  from: number;
  /** One place earlier or one place later. */
  step: -1 | 1;
}

/* 32 as drawn. `before` reaches down and sideways to make 44, never up into the field. */
const moveButton = cn(
  "border-hairline bg-surface type-studio-body text-secondary relative flex size-[32px] cursor-pointer items-center justify-center border",
  "before:absolute before:-inset-x-[6px] before:top-0 before:-bottom-3",
  "disabled:cursor-not-allowed disabled:opacity-65",
  focusRing,
);

function MoveButton({ from, step }: MoveButtonProps): ReactElement {
  const { photos, mutations } = useSlots();
  const to = from + step;
  const busy = photos.uploading.has(from) || photos.uploading.has(to);
  const where = step < 0 ? "earlier" : "later";
  return (
    <button
      type="button"
      className={moveButton}
      disabled={!canMove(from, to) || busy}
      aria-label={`Move the photograph in slot ${String(from)} one place ${where}`}
      onClick={() => {
        mutations.move(from, to);
      }}
    >
      <span aria-hidden="true">{step < 0 ? "←" : "→"}</span>
    </button>
  );
}

/**
 * What sits under a slot that holds a photograph: its description, which every
 * photograph needs before the album can be published, and for a gallery slot
 * the two buttons that move it one place earlier or later. The description is
 * saved when focus leaves the box.
 */
export function SlotCaption({ photo, problem }: SlotCaptionProps): ReactElement {
  const { mutations } = useSlots();
  const [draft, setDraft] = useState(photo.alt ?? "");
  const [refusal, setRefusal] = useState<string | null>(null);
  const cover = photo.position === 0;
  // Once something has been typed, the reminder to describe it has done its job.
  const error = refusal ?? (draft.trim() === "" ? problem : undefined);

  const save = async (): Promise<void> => {
    if (draft.trim() === (photo.alt ?? "")) return;
    setRefusal(await mutations.describe(photo, draft));
  };

  return (
    <div className="flex flex-col gap-[6px]">
      <Field
        surface="studio"
        multiline={false}
        label={cover ? "Cover description" : `Slot ${String(photo.position)} description`}
        placeholder="what the photograph shows"
        value={draft}
        maxLength={300}
        data-problem={`photos.${String(photo.position)}.alt`}
        {...(error ? { error } : {})}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setRefusal(null);
          setDraft(event.target.value);
        }}
        onBlur={() => {
          void save();
        }}
      />
      {cover ? null : (
        <div className="gap-space-2 flex justify-end">
          <MoveButton from={photo.position} step={-1} />
          <MoveButton from={photo.position} step={1} />
        </div>
      )}
    </div>
  );
}

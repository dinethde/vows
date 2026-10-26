import { type ChangeEvent, type DragEvent, type RefObject, useRef, useState } from "react";

import type { PhotoSlotProps, PhotoSlotState } from "./photo-slot.types";

export function hasPhoto(state: PhotoSlotState): boolean {
  return state === "Uploaded" || state === "Update";
}

interface PhotoSlotBehaviour {
  picker: RefObject<HTMLInputElement | null>;
  /** A file is being held over the slot. */
  dragging: boolean;
  /** Empty, Uploaded and Update take a file. Uploading and Error do not. */
  takesFiles: boolean;
  press: () => void;
  pick: (event: ChangeEvent<HTMLInputElement>) => void;
  drag: (event: DragEvent<HTMLDivElement>) => void;
}

/** What the slot does, apart from what it looks like: the whole box opens the
 * picker or retries, and it is a drop zone while it can take a file. */
export function usePhotoSlot({ state, onFiles, onRetry }: PhotoSlotProps): PhotoSlotBehaviour {
  const picker = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const takesFiles = state === "Empty" || hasPhoto(state);

  const press = (): void => {
    if (state === "Error") onRetry?.();
    else if (takesFiles) picker.current?.click();
  };

  const pick = (event: ChangeEvent<HTMLInputElement>): void => {
    onFiles?.(Array.from(event.target.files ?? []));
    /* So choosing the same file again after a failure still fires. */
    event.target.value = "";
  };

  const drag = (event: DragEvent<HTMLDivElement>): void => {
    if (!takesFiles) return;
    event.preventDefault();
    setDragging(event.type !== "dragleave" && event.type !== "drop");
    if (event.type === "drop") onFiles?.(Array.from(event.dataTransfer.files));
  };

  return { picker, dragging: dragging && takesFiles, takesFiles, press, pick, drag };
}

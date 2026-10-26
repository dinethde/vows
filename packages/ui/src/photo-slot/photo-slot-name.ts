import type { PhotoSlotProps } from "./photo-slot.types";

type Naming = Pick<PhotoSlotProps, "state" | "number" | "total" | "subject" | "progress">;

function subjectOf({ subject, number, total }: Naming): string {
  if (subject !== undefined) return subject;
  if (number === undefined) return "this slot";
  return total === undefined
    ? `slot ${String(number)}`
    : `slot ${String(number)} of ${String(total)}`;
}

export function percent(progress: number | undefined): string {
  const value = Math.min(100, Math.max(0, Math.round(progress ?? 0)));
  return `${String(value)}%`;
}

/** The name of the slot's own button: what pressing it will do, and to which
 * slot. Each one contains the short word drawn in the box. */
export function slotName(naming: Naming): string {
  const subject = subjectOf(naming);

  switch (naming.state) {
    case "Empty":
      return `Add photo for ${subject}`;
    case "Uploading":
      return `Uploading photo for ${subject}, ${percent(naming.progress)}`;
    case "Error":
      return `Upload failed for ${subject}. Try again`;
    case "Uploaded":
    case "Update":
      return `Replace photo for ${subject}`;
  }
}

export function removeName(naming: Naming): string {
  return `Remove photo from ${subjectOf(naming)}`;
}

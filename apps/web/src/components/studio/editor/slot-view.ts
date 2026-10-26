import type { Photo } from "@vows/contracts";
import type { PhotoSlotState } from "@vows/ui";
import type { UploadItem } from "@/lib/upload/queue";

export interface SlotView {
  /** The Figma state of `photo_slot` to draw. */
  state: PhotoSlotState;
  /** Uploading: 0 to 100. */
  progress: number;
  /** The row the API holds for this slot, if any. */
  photo: Photo | null;
  /** Error: what went wrong, in a sentence. */
  message: string | null;
  /**
   * Error: what the retry does. `upload` sends the same file again with the
   * same key. `pick` asks for the file again, because the browser no longer
   * has it or the worker could not read it.
   */
  retry: "upload" | "pick" | null;
  /** The key of the upload to retry. */
  uploadKey: string | null;
}

const FULL = 100;

const FAILURES: Record<NonNullable<Photo["errorCode"]>, string> = {
  wrong_file_type: "This file is not a photograph we can use. Choose a JPEG, PNG, WebP or TIFF.",
  file_too_large: "This file is larger than 60 MB. Export a smaller copy and try again.",
  processing_failed: "We could not read this file. Export it again and upload the new copy.",
};

const INTERRUPTED = "This upload was interrupted before it finished. Choose the file again.";

function fromUpload(upload: UploadItem, photo: Photo | null): SlotView {
  if (upload.status === "error") {
    return {
      state: "Error",
      progress: 0,
      photo,
      message: upload.message,
      retry: "upload",
      uploadKey: upload.key,
    };
  }
  return {
    state: "Uploading",
    progress: upload.progress,
    photo,
    message: null,
    retry: null,
    uploadKey: upload.key,
  };
}

function fromPhoto(photo: Photo): SlotView {
  const base = { photo, progress: 0, message: null, retry: null, uploadKey: null } as const;
  switch (photo.status) {
    case "ready":
      return { ...base, state: "Uploaded" };
    case "processing":
      // The file has arrived. The slot stays busy until the worker says ready.
      return { ...base, state: "Uploading", progress: FULL };
    case "failed":
      return {
        ...base,
        state: "Error",
        message: FAILURES[photo.errorCode ?? "processing_failed"],
        retry: "pick",
      };
    case "pending":
      // A row with no upload behind it: the tab was closed half way.
      return { ...base, state: "Error", message: INTERRUPTED, retry: "pick" };
  }
}

/**
 * What one slot shows, from the two things that know: the API's row and this
 * browser's upload queue. A file on its way wins, because the row lags behind
 * it. A failure is never drawn as an empty slot.
 */
export function slotView(photo: Photo | undefined, upload: UploadItem | undefined): SlotView {
  if (upload) return fromUpload(upload, photo ?? null);
  if (photo) return fromPhoto(photo);
  return { state: "Empty", progress: 0, photo: null, message: null, retry: null, uploadKey: null };
}

/** The worker is still busy with something, so the list is worth asking for again. */
export function needsPolling(photos: Photo[] | undefined): boolean {
  return (photos ?? []).some(
    (photo) => photo.status === "pending" || photo.status === "processing",
  );
}

import { MAX_UPLOAD_BYTES, UPLOAD_MIME_TYPES } from "@vows/contracts";
import type { CreateUploadUrl } from "@vows/contracts";

export type UploadMime = CreateUploadUrl["contentType"];

/** What the file picker offers. The same list the API accepts. */
export const UPLOAD_ACCEPT = UPLOAD_MIME_TYPES.join(",");

const MEGABYTE = 1024 * 1024;

export function isUploadMime(type: string): type is UploadMime {
  return (UPLOAD_MIME_TYPES as readonly string[]).includes(type);
}

/**
 * Checked in the browser so a 200 MB file is turned away before it is sent,
 * not after. The API checks again; this is a courtesy, that is the rule.
 * Returns the sentence to show, or null when the file may go.
 */
export function refusal(file: Pick<File, "name" | "type" | "size">): string | null {
  if (!isUploadMime(file.type)) {
    return `${file.name} is not a photograph we can use. Choose a JPEG, PNG, WebP or TIFF.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    const limit = String(MAX_UPLOAD_BYTES / MEGABYTE);
    return `${file.name} is larger than ${limit} MB. Export a smaller copy and try again.`;
  }
  if (file.size === 0) return `${file.name} is empty. Export it again and try once more.`;
  return null;
}

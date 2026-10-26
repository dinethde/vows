import { thumbHashToDataURL } from "thumbhash";

import type { Photo } from "@vows/contracts";

export interface PhotoSources {
  avif: string;
  webp: string;
  /** The file a browser with no srcset support falls back to. */
  fallback: string;
}

function srcset(photo: Photo, format: "avif" | "webp"): string {
  return photo.derivatives
    .filter((file) => file.format === format)
    .sort((a, b) => a.width - b.width)
    .map((file) => `${file.url} ${String(file.width)}w`)
    .join(", ");
}

/** AVIF first, WebP for everyone else. Nothing falls back to JPEG. */
export function sourcesFor(photo: Photo): PhotoSources {
  const webp = photo.derivatives
    .filter((file) => file.format === "webp")
    .sort((a, b) => a.width - b.width);
  const middle = webp.find((file) => file.width >= 1024) ?? webp.at(-1);
  return { avif: srcset(photo, "avif"), webp: srcset(photo, "webp"), fallback: middle?.url ?? "" };
}

/** About 25 bytes become a blurred picture, with no request of its own. */
export function placeholderFor(photo: Photo): string | null {
  if (!photo.thumbhash) return null;
  try {
    return thumbHashToDataURL(Buffer.from(photo.thumbhash, "base64"));
  } catch {
    return null;
  }
}

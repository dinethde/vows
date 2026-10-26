import { useQuery } from "@tanstack/react-query";
import { COVER_POSITION, GALLERY_SIZE } from "@vows/contracts";
import type { Photo, StudioAlbum } from "@vows/contracts";

import { PHOTO_POLL_MS, studioKeys } from "@/components/studio/query-keys";
import { useApi } from "@/components/studio/shell/api-context";
import { useAlbumUploads, useUploadQueue } from "@/components/studio/shell/upload-context";
import { placeFiles } from "@/lib/upload/place";
import type { Rejection } from "@/lib/upload/queue";

import { needsPolling, slotView } from "./slot-view";
import type { SlotView } from "./slot-view";

export interface AlbumPhotos {
  photos: Photo[];
  /** One entry per slot, 0 for the cover and 1 to 18 for the gallery. */
  views: Map<number, SlotView>;
  /** Slots with a file on its way from this browser. */
  uploading: Set<number>;
  /** How many of the 18 gallery slots hold a finished photograph. */
  added: number;
  /** Files that were turned away before they started. */
  rejections: Rejection[];
  /** The list could not be refreshed. What is shown may be out of date. */
  stale: boolean;
  addFiles: (position: number, files: File[]) => void;
  retryUpload: (key: string) => void;
}

/** The server page already has the album, so the first paint needs no request. */
function initialPhotos(album: StudioAlbum): Photo[] {
  return album.cover ? [album.cover, ...album.photos] : album.photos;
}

/**
 * The album's photographs as the Studio draws them: the API's rows, read
 * again every three seconds while the worker is busy, joined with whatever
 * this browser is still sending.
 */
export function useAlbumPhotos(album: StudioAlbum): AlbumPhotos {
  const api = useApi();
  const queue = useUploadQueue();
  const uploads = useAlbumUploads(album.id);
  const query = useQuery({
    queryKey: studioKeys.photos(album.id),
    queryFn: () => api.photos.list(album.id),
    initialData: () => initialPhotos(album),
    refetchInterval: (current) => (needsPolling(current.state.data) ? PHOTO_POLL_MS : false),
  });

  const photos = query.data;
  const bySlot = new Map(photos.map((photo) => [photo.position, photo]));
  const sending = new Map(uploads.items.map((item) => [item.position, item]));
  const views = new Map<number, SlotView>();
  for (let position = COVER_POSITION; position <= GALLERY_SIZE; position += 1) {
    views.set(position, slotView(bySlot.get(position), sending.get(position)));
  }
  const uploading = new Set(
    uploads.items.filter((item) => item.status !== "error").map((item) => item.position),
  );

  return {
    photos,
    views,
    uploading,
    added: photos.filter((photo) => photo.position !== COVER_POSITION && photo.status === "ready")
      .length,
    rejections: uploads.rejections,
    stale: query.isError,
    addFiles: (position, files) => {
      placeFiles(queue, {
        albumId: album.id,
        target: position,
        files,
        taken: new Set([...bySlot.keys(), ...uploading]),
      });
    },
    retryUpload: (key) => {
      queue.retry(key);
    },
  };
}

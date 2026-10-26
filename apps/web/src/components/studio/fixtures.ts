import type { Photo, StudioAlbum } from "@vows/contracts";

/** Made-up albums and photographs for tests. Nothing here is real data. */
export function photoAt(position: number, changes: Partial<Photo> = {}): Photo {
  return {
    id: `pho_slot${String(position).padStart(4, "0")}`,
    albumId: "alb_000019",
    position,
    status: "ready",
    errorCode: null,
    width: 1600,
    height: 1067,
    thumbhash: null,
    alt: `Photograph ${String(position)}`,
    derivatives: [
      {
        id: `drv_slot${String(position).padStart(4, "0")}`,
        format: "webp",
        width: 640,
        height: 427,
        url: `https://media.test.vows.lk/p/${String(position)}-640.webp`,
        bytes: 40_000,
      },
    ],
    ...changes,
  };
}

/** A cover and all eighteen, each ready and described. */
export function fullGallery(): Photo[] {
  return Array.from({ length: 19 }, (_, position) => photoAt(position));
}

export function albumWith(photos: Photo[], changes: Partial<StudioAlbum> = {}): StudioAlbum {
  return {
    id: "alb_000019",
    slug: "album-19",
    title: "Album 19",
    coupleNames: null,
    shotOn: null,
    timeOfDay: null,
    weddingType: null,
    location: null,
    story: null,
    coverFocalPoint: null,
    seoTitle: null,
    seoDescription: null,
    publishedAt: null,
    cover: photos.find((photo) => photo.position === 0) ?? null,
    photos: photos.filter((photo) => photo.position !== 0),
    stage: photos.length === 0 ? "untouched" : "draft",
    photoCount: photos.length,
    updatedAt: "2026-10-12T08:00:00.000Z",
    ...changes,
  };
}

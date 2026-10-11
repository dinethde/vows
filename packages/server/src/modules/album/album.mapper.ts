import { COVER_POSITION } from '@vows/contracts';
import type {
  Album,
  AlbumSummary,
  Photo,
  StudioAlbumStage,
  StudioAlbumSummary,
} from '@vows/contracts';

import type { AlbumRow, PhotoWithFiles } from './album.repository';

export type UrlFor = (key: string) => string;

const PHOTO_ERRORS: readonly string[] = ['wrong_file_type', 'file_too_large', 'processing_failed'];

export function toPhoto(row: PhotoWithFiles, urlFor: UrlFor): Photo {
  return {
    id: row.id,
    albumId: row.albumId,
    position: row.position,
    status: row.status,
    errorCode: PHOTO_ERRORS.includes(row.errorCode ?? '')
      ? (row.errorCode as Photo['errorCode'])
      : null,
    width: row.width,
    height: row.height,
    thumbhash: row.thumbhash,
    alt: row.alt,
    // The share card is a file for chat apps, not for the page.
    derivatives: row.derivatives
      .filter((file) => file.format !== 'jpeg')
      .map((file) => ({
        id: file.id,
        format: file.format as 'avif' | 'webp',
        width: file.width,
        height: file.height,
        url: urlFor(file.key),
        bytes: file.bytes,
      })),
  };
}

function coverOf(row: AlbumRow, photos: PhotoWithFiles[]): PhotoWithFiles | undefined {
  return photos.find((photo) => photo.id === row.coverPhotoId && photo.albumId === row.id);
}

export function toSummary(row: AlbumRow, photos: PhotoWithFiles[], urlFor: UrlFor): AlbumSummary {
  const cover = coverOf(row, photos);
  const hasFocus = row.coverFocalX !== null && row.coverFocalY !== null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    coupleNames: row.coupleNames,
    shotOn: row.shotOn,
    timeOfDay: row.timeOfDay,
    weddingType: row.weddingType,
    location: row.location,
    story: row.story,
    coverFocalPoint: hasFocus ? { x: row.coverFocalX ?? 50, y: row.coverFocalY ?? 50 } : null,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    cover: cover ? toPhoto(cover, urlFor) : null,
  };
}

export function toAlbum(row: AlbumRow, photos: PhotoWithFiles[], urlFor: UrlFor): Album {
  const mine = photos.filter((photo) => photo.albumId === row.id);
  const card = coverOf(row, mine)?.derivatives.find((file) => file.format === 'jpeg');
  return {
    ...toSummary(row, mine, urlFor),
    photos: mine
      .filter((photo) => photo.position !== COVER_POSITION)
      .map((photo) => toPhoto(photo, urlFor)),
    shareCardUrl: card ? urlFor(card.key) : null,
  };
}

/** Worked out here and nowhere else, so the counts and the cards cannot disagree. */
export function stageOf(row: AlbumRow, photoCount: number): StudioAlbumStage {
  if (row.status !== 'draft') return row.status;
  const words = [
    row.coupleNames,
    row.shotOn,
    row.timeOfDay,
    row.weddingType,
    row.location,
    row.story,
  ];
  return photoCount === 0 && words.every((word) => word === null) ? 'untouched' : 'draft';
}

export function toStudioSummary(
  row: AlbumRow,
  photos: PhotoWithFiles[],
  urlFor: UrlFor,
): StudioAlbumSummary {
  const mine = photos.filter((photo) => photo.albumId === row.id);
  return {
    ...toSummary(row, mine, urlFor),
    stage: stageOf(row, mine.length),
    photoCount: mine.length,
    updatedAt: row.updatedAt.toISOString(),
  };
}

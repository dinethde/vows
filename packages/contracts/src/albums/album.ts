import { z } from "zod";

import { photo } from "../photographs/photo";
import { isoDate, isoDateTime } from "../shared/dates";
import { albumId, slug } from "../shared/ids";

/** What the database stores. */
export const ALBUM_STATUSES = ["draft", "published", "archived"] as const;
export const albumStatus = z.enum(ALBUM_STATUSES);
export type AlbumStatus = z.infer<typeof albumStatus>;

/** What the Studio shows. `untouched` is a draft with nothing in it yet. */
export const STUDIO_ALBUM_STAGES = ["untouched", "draft", "published", "archived"] as const;
export const studioAlbumStage = z.enum(STUDIO_ALBUM_STAGES);
export type StudioAlbumStage = z.infer<typeof studioAlbumStage>;

/** The set is fixed. There is no create route and no delete route. */
export const ALBUM_COUNT = 22;

const focalPoint = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

const albumFields = {
  id: albumId,
  slug,
  title: z.string(),
  coupleNames: z.string().nullable(),
  shotOn: isoDate.nullable(),
  timeOfDay: z.string().nullable(),
  weddingType: z.string().nullable(),
  location: z.string().nullable(),
  story: z.string().nullable(),
  coverFocalPoint: focalPoint.nullable(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  publishedAt: isoDateTime.nullable(),
};

/** One tile on the home page. */
export const albumSummary = z.object({
  ...albumFields,
  cover: photo.nullable(),
});
export type AlbumSummary = z.infer<typeof albumSummary>;

/** The album page: the cover and the eighteen photographs in order. */
export const album = albumSummary.extend({
  photos: z.array(photo),
  shareCardUrl: z.string().url().nullable(),
});
export type Album = z.infer<typeof album>;

export const studioAlbumSummary = albumSummary.extend({
  stage: studioAlbumStage,
  photoCount: z.number().int().nonnegative(),
  updatedAt: isoDateTime,
});
export type StudioAlbumSummary = z.infer<typeof studioAlbumSummary>;

export const studioAlbum = studioAlbumSummary.extend({ photos: z.array(photo) });
export type StudioAlbum = z.infer<typeof studioAlbum>;

/** The counts come from the same query as the cards, so they always add up. */
export const studioAlbumList = z.object({
  data: z.array(studioAlbumSummary),
  nextCursor: z.string().nullable(),
  counts: z.object({
    all: z.number().int(),
    published: z.number().int(),
    draft: z.number().int(),
    untouched: z.number().int(),
  }),
});
export type StudioAlbumList = z.infer<typeof studioAlbumList>;

const text = (max: number): z.ZodNullable<z.ZodString> =>
  z.string().trim().min(1).max(max).nullable();

export const updateAlbum = z
  .object({
    slug,
    coupleNames: text(120),
    shotOn: isoDate.nullable(),
    timeOfDay: text(40),
    weddingType: text(60),
    location: text(160),
    story: text(600),
    coverFocalPoint: focalPoint.nullable(),
    seoTitle: text(70),
    seoDescription: text(160),
  })
  .partial()
  .refine((body) => Object.keys(body).length > 0, "Send at least one field.");
export type UpdateAlbum = z.infer<typeof updateAlbum>;

/** Why an album cannot go out yet. One entry per problem, named by field. */
export const PUBLISH_PROBLEMS = [
  "missing_couple_names",
  "missing_shot_on",
  "missing_cover",
  "missing_photo",
  "photo_not_ready",
  "missing_alt",
] as const;
export const publishProblem = z.object({
  problem: z.enum(PUBLISH_PROBLEMS),
  position: z.number().int().nullable(),
});
export type PublishProblem = z.infer<typeof publishProblem>;

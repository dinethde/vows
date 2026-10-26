import type { StudioAlbum, UpdateAlbum } from "@vows/contracts";
import { z } from "zod";

import { formatDateText, parseDateText } from "@/components/shared/date/date-text";

const text = (max: number, what: string): z.ZodString =>
  z.string().max(max, `Keep ${what} to ${String(max)} characters or fewer.`);

/**
 * What the form holds while it is being edited: every field is text, and the
 * date is the text in the box. This check is a courtesy for the person typing.
 * The API checks everything again, and that check is the rule.
 */
export const albumFormSchema = z.object({
  coupleNames: text(120, "the names"),
  shotOn: z.string().refine((value) => value.trim() === "" || parseDateText(value) !== null, {
    message: "Write the date in full, like 17 January 2025.",
  }),
  timeOfDay: text(40, "the time of day"),
  weddingType: text(60, "the wedding type"),
  location: text(160, "the location"),
  slug: z
    .string()
    .trim()
    .min(2, "A page address needs at least two characters.")
    .max(80, "Keep the page address to 80 characters or fewer.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Use lower-case letters, numbers and hyphens only, like benali-yasiru.",
    }),
  story: text(600, "the story"),
});

export type AlbumFormValues = z.infer<typeof albumFormSchema>;
export type AlbumFieldName = keyof AlbumFormValues;

/** In the order the fields are drawn, which is the order focus moves through them. */
export const FIELD_ORDER: AlbumFieldName[] = [
  "coupleNames",
  "shotOn",
  "timeOfDay",
  "weddingType",
  "location",
  "slug",
  "story",
];

export function toFormValues(album: StudioAlbum): AlbumFormValues {
  return {
    coupleNames: album.coupleNames ?? "",
    shotOn: formatDateText(album.shotOn),
    timeOfDay: album.timeOfDay ?? "",
    weddingType: album.weddingType ?? "",
    location: album.location ?? "",
    slug: album.slug,
    story: album.story ?? "",
  };
}

function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Only the fields that were edited, in the API's shape: an emptied field is
 * sent as null, and the date as a plain day. Null when nothing changed, so the
 * caller can skip the request.
 */
export function toChanges(
  values: AlbumFormValues,
  dirty: Partial<Record<AlbumFieldName, boolean | undefined>>,
): UpdateAlbum | null {
  const changes: UpdateAlbum = {};
  if (dirty.coupleNames) changes.coupleNames = orNull(values.coupleNames);
  if (dirty.shotOn) changes.shotOn = parseDateText(values.shotOn);
  if (dirty.timeOfDay) changes.timeOfDay = orNull(values.timeOfDay);
  if (dirty.weddingType) changes.weddingType = orNull(values.weddingType);
  if (dirty.location) changes.location = orNull(values.location);
  if (dirty.story) changes.story = orNull(values.story);
  if (dirty.slug) changes.slug = values.slug.trim();
  return Object.keys(changes).length > 0 ? changes : null;
}

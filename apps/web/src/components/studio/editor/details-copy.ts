import type { AlbumFieldName } from "./album-form.schema";

/** Shown as `vows.lk/albums/`. Figma draws `vows.studio/albums/`; the site's address is vows.lk. */
export const ADDRESS_PREFIX = "vows.lk/albums/";

export interface TextFieldSpec {
  name: Exclude<AlbumFieldName, "shotOn" | "story" | "slug">;
  label: string;
  /** Lower case, as Figma writes the empty fields. */
  placeholder: string;
  /** The line under the field while it has the focus: what the field is for. */
  help: string;
}

/** The couple's names first; then the three one-line details, in the order drawn. */
export const TEXT_FIELDS: [TextFieldSpec, ...TextFieldSpec[]] = [
  {
    name: "coupleNames",
    label: "Couple names",
    placeholder: "couple name",
    help: "This becomes the album’s title on the website.",
  },
  {
    name: "timeOfDay",
    label: "Wedding time",
    placeholder: "morning",
    help: "The part of the day, shown in brackets above the date.",
  },
  {
    name: "weddingType",
    label: "Wedding type",
    placeholder: "type of the wedding photography",
    help: "A word or two for the style of the day, such as Modern Classic.",
  },
  {
    name: "location",
    label: "Wedding location",
    placeholder: "wedding venue",
    help: "The venue, as it should read on the album page.",
  },
];

export const HELP: Record<"shotOn" | "slug" | "story", string> = {
  shotOn: "Type the date in full, or choose it from the calendar.",
  slug: "Where the album lives on the website. Lower-case letters, numbers and hyphens.",
  story: "A short paragraph about the day, shown beside the couple’s names.",
};

export const SLUG_WARNING =
  "This album is live. Links already shared will be sent on to the new address.";

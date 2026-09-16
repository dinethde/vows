/**
 * Album content (DESIGN.md §12.2).
 *
 * One typed record per event: the facts the hero bar carries, the story note,
 * and an ordered list of photographs. Nothing about placement lives here — the
 * gallery walks `src/data/album-layout.ts` and feeds it this list, so an album
 * of eleven photographs and one of eighteen both lay out correctly.
 */
import { galleryPhotoIds, type AlbumPhotoId } from "./album-photos";

export type Album = {
  slug: string;
  couple: string;
  /** ISO date; the bar formats it. */
  date: string;
  /** The parenthetical time-of-day label, lowercase. */
  timeOfDay: string;
  type: string;
  location: string;
  /** A short editorial note, shown in the hero bar. */
  story: string;
  /** The hero photograph's focal point at each breakpoint (CSS object-position). */
  heroFocus: { wide: string; portrait: string };
  photos: AlbumPhotoId[];
};

/**
 * Figma's `(location)` value repeats "Wedding", duplicating `(type)`, and the
 * story paragraph is lorem. Both are placeholders; real values below.
 */
const featured: Album = {
  slug: "benali-and-yasiru",
  couple: "Benali & Yasiru",
  date: "2022-02-01",
  timeOfDay: "morning",
  type: "Wedding",
  location: "Mount Lavinia, Sri Lanka",
  // Sized to set in two lines at the bar's 632px zone, as the Figma frame does.
  story:
    "They asked for a morning ceremony, so the light would still be soft off the water, and for everyone to stay long enough that lunch turned into dinner. It did.",
  heroFocus: { wide: "50% 42%", portrait: "58% 45%" },
  photos: [...galleryPhotoIds],
};

/**
 * The other events on the home page canvas. They share the photograph pool and
 * vary in length, which is the thing that proves the layout is data-driven
 * rather than a transcription of one frame.
 */
const others: Array<{
  couple: string;
  date: string;
  timeOfDay: string;
  type: string;
  location: string;
  story: string;
  count: number;
  /** Where in the pool this album starts, so no two read the same. */
  offset: number;
}> = [
  { couple: "Amaya & Rohan", date: "2023-08-19", timeOfDay: "afternoon", type: "Wedding", location: "Kandy, Sri Lanka", story: "A hill-country wedding that ran on its own time. The rain came at four and nobody moved indoors.", count: 14, offset: 3 },
  { couple: "Nethmi & Kavinda", date: "2021-11-06", timeOfDay: "evening", type: "Wedding", location: "Bentota, Sri Lanka", story: "Two families who had never met, one long table, and a band that stayed an hour past the booking.", count: 17, offset: 7 },
  { couple: "Tara & Elias", date: "2024-05-11", timeOfDay: "golden hour", type: "Elopement", location: "Ella, Sri Lanka", story: "Six people on a ridge, a borrowed ring, and the last of the light. The whole thing took twenty minutes.", count: 11, offset: 1 },
  { couple: "Sanuli & Dinuka", date: "2023-01-28", timeOfDay: "morning", type: "Wedding", location: "Galle Fort, Sri Lanka", story: "Inside the fort walls before the heat arrived, then out along the ramparts while the town woke up.", count: 16, offset: 11 },
  { couple: "Imara & Thisath", date: "2022-09-03", timeOfDay: "evening", type: "Reception", location: "Colombo, Sri Lanka", story: "A reception that was really a homecoming — most of the room had flown in for it.", count: 13, offset: 5 },
  { couple: "Lena & Matteo", date: "2024-06-22", timeOfDay: "afternoon", type: "Wedding", location: "Puglia, Italy", story: "An olive grove, a very long lunch, and the kind of afternoon that refuses to end.", count: 18, offset: 9 },
  { couple: "Hiruni & Pasindu", date: "2021-07-17", timeOfDay: "morning", type: "Wedding", location: "Negombo, Sri Lanka", story: "The oldest church in town, filled to the back wall, and a walk to the sea afterwards.", count: 15, offset: 13 },
  { couple: "Juliette & Bastien", date: "2023-09-30", timeOfDay: "golden hour", type: "Wedding", location: "Annecy, France", story: "Lake light all evening, and a ceremony that started late because the boat did.", count: 12, offset: 2 },
  { couple: "Kavisha & Tharindu", date: "2022-12-10", timeOfDay: "evening", type: "Wedding", location: "Nuwara Eliya, Sri Lanka", story: "Cold enough for coats over the suits. Nobody minded once the fires were lit.", count: 17, offset: 6 },
  { couple: "Noor & Idris", date: "2024-03-16", timeOfDay: "afternoon", type: "Nikah", location: "Colombo, Sri Lanka", story: "A house full of relatives, a courtyard full of flowers, and one very patient grandmother.", count: 14, offset: 15 },
  { couple: "Anoushka & Wickramasinghe", date: "2021-04-24", timeOfDay: "morning", type: "Wedding", location: "Anuradhapura, Sri Lanka", story: "Traditional from the first drumbeat to the last, and photographed the same way — quietly, from the side.", count: 16, offset: 4 },
  { couple: "Maya & Cem", date: "2023-06-08", timeOfDay: "evening", type: "Wedding", location: "Istanbul, Türkiye", story: "The ferry crossed twice while we shot. Both times the whole party waved at strangers.", count: 13, offset: 10 },
  { couple: "Dilini & Sajith", date: "2022-05-21", timeOfDay: "afternoon", type: "Wedding", location: "Weligama, Sri Lanka", story: "Barefoot by three, in the water by six, still going at midnight.", count: 15, offset: 8 },
  { couple: "Freya & Jonas", date: "2024-08-02", timeOfDay: "golden hour", type: "Elopement", location: "Lofoten, Norway", story: "Two of us, two of them, and a boat. The sun never really set.", count: 11, offset: 12 },
  { couple: "Rashmi & Akila", date: "2021-10-09", timeOfDay: "morning", type: "Wedding", location: "Matara, Sri Lanka", story: "A garden they had grown themselves, and a ceremony under the tree they planted first.", count: 18, offset: 0 },
  { couple: "Clara & Wu", date: "2023-11-25", timeOfDay: "evening", type: "Reception", location: "Singapore", story: "Eighteen floors up, the city doing its thing in the window behind every photograph.", count: 12, offset: 14 },
  { couple: "Senuri & Mihiran", date: "2022-08-13", timeOfDay: "afternoon", type: "Wedding", location: "Sigiriya, Sri Lanka", story: "The rock in every wide frame whether we planned it or not. Eventually we planned it.", count: 16, offset: 16 },
  { couple: "Aiko & Daniel", date: "2024-04-06", timeOfDay: "morning", type: "Wedding", location: "Kyoto, Japan", story: "Blossom, barely. We were four days early and it was better for it.", count: 14, offset: 17 },
  { couple: "Nadia & Emre", date: "2021-09-18", timeOfDay: "evening", type: "Wedding", location: "Colombo, Sri Lanka", story: "A city wedding that emptied onto the street at the end, which is where the best of it happened.", count: 13, offset: 6 },
  { couple: "Piumi & Chathura", date: "2023-03-04", timeOfDay: "afternoon", type: "Wedding", location: "Hikkaduwa, Sri Lanka", story: "Wind all day. Every veil photograph from this one is a wrestling match.", count: 17, offset: 3 },
  { couple: "Greta & Olav", date: "2024-07-13", timeOfDay: "golden hour", type: "Wedding", location: "Bergen, Norway", story: "Rain, then not, then rain. The umbrellas became the decoration.", count: 15, offset: 11 },
];

/** Matches the home page's `tileSlug`, so a tile links straight to its album. */
export function albumSlug(couple: string) {
  return couple
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function rotate(offset: number, count: number): AlbumPhotoId[] {
  const pool = galleryPhotoIds;
  return Array.from(
    { length: Math.min(count, pool.length) },
    (_, i) => pool[(i + offset) % pool.length]!,
  );
}

export const albums: Record<string, Album> = {
  [featured.slug]: featured,
  ...Object.fromEntries(
    others.map((entry) => {
      const slug = albumSlug(entry.couple);
      const album: Album = {
        slug,
        couple: entry.couple,
        date: entry.date,
        timeOfDay: entry.timeOfDay,
        type: entry.type,
        location: entry.location,
        story: entry.story,
        heroFocus: { wide: "50% 42%", portrait: "58% 45%" },
        photos: rotate(entry.offset, entry.count),
      };
      return [slug, album];
    }),
  ),
};

export function getAlbum(slug: string): Album | undefined {
  // Own-property check, not a bare lookup: `albums` is an ordinary object, so
  // `/albums/constructor` and `/albums/__proto__` would otherwise return an
  // inherited member, sail past the loader's `notFound()` and crash the page
  // when it is read as an album.
  return Object.hasOwn(albums, slug) ? albums[slug] : undefined;
}

/** `01/02/2022`, as the Figma bar shows it. */
export function formatAlbumDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

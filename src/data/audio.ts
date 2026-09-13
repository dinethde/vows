/**
 * The ambience track slot (DESIGN.md §10).
 * Generated from scripts/audio.manifest.json — edit that, then run
 * `node scripts/prepare-audio.mjs --force`.
 */
export type Track = {
  /** Path under public/. */
  src: string;
  /** MIME type for the <source> element. */
  type: string;
  title: string;
  artist: string;
  licence: string;
  attribution: string;
};

export const track: Track = {
  src: "/audio/ambience.m4a",
  type: "audio/mp4",
  title: "Night on the Docks",
  artist: "Kevin MacLeod",
  licence: "CC BY 4.0",
  attribution: "\"Night on the Docks - Sax\" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0",
};

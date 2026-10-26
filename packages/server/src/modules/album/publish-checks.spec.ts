import { describe, expect, it } from "vitest";

import { problemFields, publishProblems } from "./publish-checks";
import type { PublishablePhoto } from "./publish-checks";

const album = { coupleNames: "Benali & Yasiru", shotOn: "2022-01-02", coverPhotoId: "pho_cover" };

function fullSet(): PublishablePhoto[] {
  return Array.from({ length: 19 }, (_unused, position) => ({
    id: position === 0 ? "pho_cover" : `pho_${String(position)}`,
    position,
    status: "ready",
    alt: "The bride’s mother fixing her veil in a doorway",
  }));
}

describe("publishProblems", () => {
  it("passes an album with a cover, eighteen photographs and a description on each", () => {
    expect(publishProblems(album, fullSet())).toEqual([]);
  });

  it("refuses to publish an album with no cover", () => {
    const photos = fullSet().filter((photo) => photo.position !== 0);
    expect(publishProblems(album, photos)).toEqual([{ problem: "missing_cover", position: 0 }]);
  });

  it("refuses a cover that is not the photograph in the cover slot", () => {
    const problems = publishProblems({ ...album, coverPhotoId: "pho_other" }, fullSet());
    expect(problems).toEqual([{ problem: "missing_cover", position: 0 }]);
  });

  it("names every photograph with no description, by slot", () => {
    const photos = fullSet().map((photo) =>
      [4, 12].includes(photo.position) ? { ...photo, alt: "  " } : photo,
    );
    expect(publishProblems(album, photos)).toEqual([
      { problem: "missing_alt", position: 4 },
      { problem: "missing_alt", position: 12 },
    ]);
  });

  it("names an empty slot and a photograph still processing", () => {
    const photos = fullSet()
      .filter((photo) => photo.position !== 7)
      .map((photo) => (photo.position === 9 ? { ...photo, status: "processing" } : photo));
    expect(publishProblems(album, photos)).toEqual([
      { problem: "missing_photo", position: 7 },
      { problem: "photo_not_ready", position: 9 },
    ]);
  });

  it("asks for the couple’s names and the date", () => {
    const problems = publishProblems({ ...album, coupleNames: null, shotOn: null }, fullSet());
    expect(problems.map((item) => item.problem)).toEqual([
      "missing_couple_names",
      "missing_shot_on",
    ]);
  });
});

describe("problemFields", () => {
  it("says what to do, keyed by the field it is about", () => {
    const fields = problemFields([
      { problem: "missing_alt", position: 4 },
      { problem: "missing_cover", position: 0 },
    ]);
    expect(fields).toEqual({
      "photos.4.alt": "Describe the photograph in slot 4.",
      cover: "Add a cover photograph.",
    });
  });
});

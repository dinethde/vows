import { describe, expect, it } from "vitest";

import {
  JOBS,
  MAX_UPLOAD_BYTES,
  albumId,
  createEnquiry,
  createUploadUrl,
  errorEnvelope,
  page,
  photoId,
  reorderPhotos,
  slug,
  updateAlbum,
  updatePhoto,
} from "./index";

const enquiry = {
  name: "Benali Perera",
  email: "benali.perera@gmail.com",
  phone: "+94 71 657 0999",
  weddingDate: "2027-02-14",
  weddingPlace: "Mount Lavinia Hotel",
  notes: "Outdoor ceremony at sunset, about 120 guests.",
  website: "",
  openedAt: 1791526403117,
};

describe("createEnquiry", () => {
  it("accepts a complete enquiry", () => {
    expect(createEnquiry.safeParse(enquiry).success).toBe(true);
  });

  it("accepts an enquiry with no place and no notes", () => {
    const { weddingPlace: _place, notes: _notes, ...rest } = enquiry;
    expect(createEnquiry.safeParse(rest).success).toBe(true);
  });

  it("tells the visitor how to fix a half-typed email", () => {
    const result = createEnquiry.safeParse({ ...enquiry, email: "benali.perera@gmail" });
    expect(result.error?.flatten().fieldErrors.email).toEqual([
      "That does not look like a full email address. Try name@example.com",
    ]);
  });

  it.each([
    ["a filled honeypot", { website: "https://spam.example" }],
    ["a missing phone number", { phone: "" }],
    ["a date written the wrong way round", { weddingDate: "14/02/2027" }],
    ["notes past 2,000 characters", { notes: "a".repeat(2001) }],
    ["a one-letter name", { name: "B" }],
  ])("rejects %s", (_label, change) => {
    expect(createEnquiry.safeParse({ ...enquiry, ...change }).success).toBe(false);
  });
});

describe("ids and slugs", () => {
  it("accepts an id with the right prefix and refuses another kind", () => {
    expect(albumId.safeParse("alb_7k2m9x").success).toBe(true);
    expect(albumId.safeParse("pho_7k2m9x").success).toBe(false);
    expect(photoId.safeParse("pho_9x4q2b").success).toBe(true);
  });

  it.each(["Benali & Yasiru", "benali--yasiru", "-benali", "a"])("refuses the slug %s", (value) => {
    expect(slug.safeParse(value).success).toBe(false);
  });

  it("accepts a slug of words joined by hyphens", () => {
    expect(slug.safeParse("benali-yasiru-2022").success).toBe(true);
  });
});

describe("updateAlbum", () => {
  it("accepts one field, and null to clear it", () => {
    expect(updateAlbum.safeParse({ coupleNames: "Benali & Yasiru" }).success).toBe(true);
    expect(updateAlbum.safeParse({ story: null }).success).toBe(true);
  });

  it.each([
    ["an empty body", {}],
    ["an empty string where null is meant", { coupleNames: "   " }],
    ["a focal point outside the photograph", { coverFocalPoint: { x: 120, y: 50 } }],
  ])("rejects %s", (_label, body) => {
    expect(updateAlbum.safeParse(body).success).toBe(false);
  });
});

describe("photographs", () => {
  const upload = { position: 3, contentType: "image/jpeg", bytes: 4_200_000 };

  it("accepts an upload into the cover slot and into slot 18", () => {
    expect(createUploadUrl.safeParse({ ...upload, position: 0 }).success).toBe(true);
    expect(createUploadUrl.safeParse({ ...upload, position: 18 }).success).toBe(true);
  });

  it.each([
    ["slot 19", { position: 19 }],
    ["a file over 60 MB", { bytes: MAX_UPLOAD_BYTES + 1 }],
    ["a file that is not an image", { contentType: "application/pdf" }],
  ])("rejects %s", (_label, change) => {
    expect(createUploadUrl.safeParse({ ...upload, ...change }).success).toBe(false);
  });

  it("wants all eighteen slots in a reorder, empty ones as null", () => {
    const slots = Array.from({ length: 18 }, (_unused, index) =>
      index === 0 ? "pho_9x4q2b" : null,
    );
    expect(reorderPhotos.safeParse({ slots }).success).toBe(true);
    expect(reorderPhotos.safeParse({ slots: slots.slice(1) }).success).toBe(false);
  });

  it("refuses an alt text that is only spaces", () => {
    expect(updatePhoto.safeParse({ alt: "   " }).success).toBe(false);
    expect(updatePhoto.safeParse({ alt: "Her mother fixing the veil in a doorway" }).success).toBe(
      true,
    );
  });
});

describe("the envelope and collections", () => {
  it("accepts an error with a field map and refuses an unknown code", () => {
    const error = { code: "album_not_publishable", message: "Add a cover.", requestId: "req_1" };
    expect(
      errorEnvelope.safeParse({ error: { ...error, fields: { cover: "Required" } } }).success,
    ).toBe(true);
    expect(errorEnvelope.safeParse({ error: { ...error, code: "oops" } }).success).toBe(false);
  });

  it("refuses a bare array where a wrapped collection is expected", () => {
    const list = page(albumId);
    expect(list.safeParse({ data: ["alb_7k2m9x"], nextCursor: null }).success).toBe(true);
    expect(list.safeParse(["alb_7k2m9x"]).success).toBe(false);
  });
});

describe("job payloads", () => {
  it("carry an id and refuse an embedded object", () => {
    expect(JOBS["photo.derive"].safeParse({ photoId: "pho_9x4q2b" }).success).toBe(true);
    expect(JOBS["photo.derive"].safeParse({ photo: { id: "pho_9x4q2b" } }).success).toBe(false);
    expect(
      JOBS["album.revalidate"].safeParse({ albumId: "alb_7k2m9x", slug: "benali-yasiru" }).success,
    ).toBe(true);
  });
});

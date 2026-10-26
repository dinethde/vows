import { describe, expect, it } from "vitest";

import { albumId, photoId } from "@vows/contracts";

import { newId } from "./ids";

describe("newId", () => {
  it("makes an id its own contract schema accepts", () => {
    expect(albumId.safeParse(newId("album")).success).toBe(true);
    expect(photoId.safeParse(newId("photo")).success).toBe(true);
  });

  it("says what kind of thing it is, and refuses to pass as another", () => {
    expect(newId("enquiry")).toMatch(/^enq_/);
    expect(albumId.safeParse(newId("photo")).success).toBe(false);
  });

  it("does not repeat", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => newId("photo")));
    expect(ids.size).toBe(1000);
  });
});

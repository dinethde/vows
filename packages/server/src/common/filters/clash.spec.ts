import { describe, expect, it } from "vitest";

import { clashOf } from "./clash";

const unique = (constraint: string): object => ({ code: "23505", constraint });

describe("a write that loses a race", () => {
  it("names the slot when two uploads take the same one", () => {
    expect(clashOf(unique("photo_album_position_idx"))?.code).toBe("photo_slot_taken");
  });

  it("names the address when two albums take the same one", () => {
    expect(clashOf(unique("album_slug_unique"))?.code).toBe("slug_taken");
  });

  it("finds the driver error inside the query builder’s wrapper", () => {
    const wrapped = Object.assign(new Error("Failed query"), {
      cause: unique("album_slug_unique"),
    });
    expect(clashOf(wrapped)?.code).toBe("slug_taken");
  });

  it("leaves every other failure alone", () => {
    expect(clashOf(unique("some_other_index"))).toBeUndefined();
    expect(clashOf({ code: "23503", constraint: "album_slug_unique" })).toBeUndefined();
    expect(clashOf(new Error("storage is down"))).toBeUndefined();
    expect(clashOf(null)).toBeUndefined();
  });
});

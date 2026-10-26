import { describe, expect, it } from "vitest";

import { fullDate } from "./dates";

describe("fullDate", () => {
  it("writes the day in full, whatever time zone the build runs in", () => {
    expect(fullDate("2022-01-02")).toBe("2 January 2022");
    expect(fullDate("2026-12-31")).toBe("31 December 2026");
  });
});

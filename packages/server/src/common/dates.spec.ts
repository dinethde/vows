import { describe, expect, it } from "vitest";

import { colomboTime, fullDate } from "./dates";

describe("dates for a person to read", () => {
  it("writes a day in full", () => {
    expect(fullDate("2027-02-14")).toBe("14 February 2027");
    expect(fullDate("2022-01-02")).toBe("2 January 2022");
  });

  it("writes an instant in Colombo time, five and a half hours ahead of UTC", () => {
    expect(colomboTime(new Date("2026-10-09T08:33:00Z"))).toBe("9 October 2026 at 14:03");
  });
});

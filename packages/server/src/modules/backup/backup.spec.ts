import { describe, expect, it } from "vitest";

import { expired } from "./backup.service";

const sundays = Array.from(
  { length: 10 },
  (_unused, week) =>
    `backups/2026-0${String(Math.floor(week / 4) + 7)}-${String((week % 4) * 7 + 1).padStart(2, "0")}.dump`,
);

describe("which backups to delete", () => {
  it("keeps the newest eight and names the rest", () => {
    expect(expired(sundays)).toEqual(sundays.slice(0, 2));
  });

  it("deletes nothing while there are eight or fewer", () => {
    expect(expired(sundays.slice(0, 8))).toEqual([]);
    expect(expired([])).toEqual([]);
  });

  it("does not depend on the order the bucket lists them in", () => {
    expect(expired([...sundays].reverse())).toEqual(sundays.slice(0, 2));
  });
});

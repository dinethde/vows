const DAY = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** `2022-01-02` → `2 January 2022`. Never 02/01/2022, which is two different days. */
export function fullDate(isoDate: string): string {
  return DAY.format(new Date(`${isoDate}T00:00:00Z`));
}

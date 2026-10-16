const DAY = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const COLOMBO = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Colombo',
});

/** `2027-02-14` → `14 February 2027`. Never 14/02/2027, which is two different days. */
export function fullDate(isoDate: string): string {
  return DAY.format(new Date(`${isoDate}T00:00:00Z`));
}

/** An instant, written the way the studio reads a clock. */
export function colomboTime(instant: Date): string {
  return COLOMBO.format(instant).replace(',', ' at');
}

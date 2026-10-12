/*
 * Calendar arithmetic on plain days, `2027-01-14`. Everything is done in UTC,
 * so a day never slips because of the zone the browser happens to be in.
 */

const DAY_MS = 86_400_000;
const WEEK = 7;

export const WEEKDAYS = [
  { short: 'Su', long: 'Sunday' },
  { short: 'Mo', long: 'Monday' },
  { short: 'Tu', long: 'Tuesday' },
  { short: 'We', long: 'Wednesday' },
  { short: 'Th', long: 'Thursday' },
  { short: 'Fr', long: 'Friday' },
  { short: 'Sa', long: 'Saturday' },
] as const;

const MONTH_TITLE = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

function toDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Builds a day, or null when the three numbers do not name one (31 February). */
export function isoFromParts(year: number, month: number, day: number): string | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  const real =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return real && year >= 1900 && year <= 2200 ? toIso(date) : null;
}

export function todayIso(now: Date = new Date()): string {
  return toIso(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

export function shiftDays(iso: string, days: number): string {
  return toIso(new Date(toDate(iso).getTime() + days * DAY_MS));
}

/** The same day in another month, or that month's last day when it is shorter. */
export function shiftMonths(iso: string, months: number): string {
  const from = toDate(iso);
  const first = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + months, 1));
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(Math.min(from.getUTCDate(), last));
  return toIso(first);
}

/** Sunday of the week the day is in, and the Saturday. */
export function weekStart(iso: string): string {
  return shiftDays(iso, -toDate(iso).getUTCDay());
}

export function weekEnd(iso: string): string {
  return shiftDays(weekStart(iso), WEEK - 1);
}

export function sameMonth(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7);
}

/** "January 2027". */
export function monthTitle(iso: string): string {
  return MONTH_TITLE.format(toDate(iso));
}

export function dayOfMonth(iso: string): number {
  return toDate(iso).getUTCDate();
}

/**
 * The weeks to draw for the month a day is in: whole weeks from Sunday, so the
 * first and last rows carry a few days of the months either side, as Figma
 * draws them.
 */
export function monthWeeks(iso: string): string[][] {
  const first = `${iso.slice(0, 7)}-01`;
  const lastDay = shiftDays(shiftMonths(first, 1), -1);
  const weeks: string[][] = [];
  for (let day = weekStart(first); day <= lastDay; day = shiftDays(day, WEEK)) {
    weeks.push(Array.from({ length: WEEK }, (_, index) => shiftDays(day, index)));
  }
  return weeks;
}

const MOVES: Record<string, (iso: string) => string> = {
  ArrowLeft: (iso) => shiftDays(iso, -1),
  ArrowRight: (iso) => shiftDays(iso, 1),
  ArrowUp: (iso) => shiftDays(iso, -WEEK),
  ArrowDown: (iso) => shiftDays(iso, WEEK),
  Home: weekStart,
  End: weekEnd,
  PageUp: (iso) => shiftMonths(iso, -1),
  PageDown: (iso) => shiftMonths(iso, 1),
};

/** Where a key takes the focused day, or null when the key is not a movement. */
export function moveByKey(iso: string, key: string): string | null {
  return MOVES[key]?.(iso) ?? null;
}

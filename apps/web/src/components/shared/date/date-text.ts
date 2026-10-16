import { isoFromParts } from './calendar';

import { fullDate } from '@/lib/format/dates';

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

function monthNumber(word: string): number | null {
  const lower = word.toLowerCase();
  if (lower.length < 3) return null;
  const index = MONTHS.findIndex((month) => month.startsWith(lower));
  return index === -1 ? null : index + 1;
}

const WRITTEN = /^(\d{1,2})(?:st|nd|rd|th)?[\s.,-]+([a-z]+)[\s.,-]+(\d{4})$/i;
const ISO = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
/* Day first, as dates are written in Sri Lanka. */
const NUMERIC = /^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/;

/**
 * Reads a date the way a person types one: "17 January 2025", "17 Jan 2025",
 * "17/01/2025" or "2025-01-17". Returns the plain day, or null when the text
 * is not a real date.
 */
export function parseDateText(text: string): string | null {
  const value = text.trim();
  const written = WRITTEN.exec(value);
  if (written) {
    const month = monthNumber(written[2] ?? '');
    return month === null ? null : isoFromParts(Number(written[3]), month, Number(written[1]));
  }
  const iso = ISO.exec(value);
  if (iso) return isoFromParts(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  const numeric = NUMERIC.exec(value);
  if (numeric) return isoFromParts(Number(numeric[3]), Number(numeric[2]), Number(numeric[1]));
  return null;
}

/** Always in full, "17 January 2025". Never in numbers, which read two ways. */
export function formatDateText(iso: string | null): string {
  return iso ? fullDate(iso) : '';
}

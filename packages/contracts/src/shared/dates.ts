import { z } from 'zod';

/** A calendar day, `2026-03-14`. No time and no zone. */
export const isoDate = z.string().date();

/** An instant in UTC, `2026-03-14T08:30:00.000Z`. */
export const isoDateTime = z.string().datetime();

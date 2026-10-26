import { z } from "zod";

export const cursorQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().min(1).max(512).optional(),
});
export type CursorQuery = z.infer<typeof cursorQuery>;

/** A collection is always wrapped, so pagination never breaks a caller. */
export function page<Item extends z.ZodTypeAny>(
  item: Item,
): z.ZodObject<{ data: z.ZodArray<Item>; nextCursor: z.ZodNullable<z.ZodString> }> {
  return z.object({ data: z.array(item), nextCursor: z.string().nullable() });
}

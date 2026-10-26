import type { ErrorCode } from "@vows/contracts";

/** Postgres's code for "this would break a unique index". */
const UNIQUE_VIOLATION = "23505";

interface Clash {
  code: ErrorCode;
  message: string;
}

/**
 * Two requests can pass the same check and then both write. The unique index
 * is what stops the second, and its answer should be a 409 that says so, not
 * a 500 that says the fault is ours.
 */
const CLASHES: Record<string, Clash> = {
  photo_album_position_idx: {
    code: "photo_slot_taken",
    message: "That slot was filled a moment ago. Refresh and try again.",
  },
  photo_idempotency_key_unique: {
    code: "photo_slot_taken",
    message: "That upload is already under way. Refresh and try again.",
  },
  album_slug_unique: {
    code: "slug_taken",
    message: "That page address was taken a moment ago. Choose another.",
  },
};

function violation(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const { code, constraint } = error as { code?: unknown; constraint?: unknown };
  return code === UNIQUE_VIOLATION && typeof constraint === "string" ? constraint : undefined;
}

/** The driver's error, or the one the query builder wrapped around it. */
export function clashOf(error: unknown): Clash | undefined {
  const cause = (error as { cause?: unknown } | null)?.cause;
  const constraint = violation(error) ?? violation(cause);
  return constraint ? CLASHES[constraint] : undefined;
}

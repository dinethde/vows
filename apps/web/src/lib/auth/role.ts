import { ROLE_CLAIM, STUDIO_ROLES } from "./constants";
import type { StudioRole } from "./constants";

/**
 * Reads the role out of the claims of a session Clerk has already verified.
 * This only decides whether to draw the Studio. The API verifies every token
 * itself, and it is the API that guards the data.
 */
export function roleFromClaims(claims: unknown): StudioRole | null {
  if (typeof claims !== "object" || claims === null) return null;
  const metadata = (claims as Record<string, unknown>)[ROLE_CLAIM];
  if (typeof metadata !== "object" || metadata === null) return null;
  const role = (metadata as { role?: unknown }).role;
  return STUDIO_ROLES.find((known) => known === role) ?? null;
}

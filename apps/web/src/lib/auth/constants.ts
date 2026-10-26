/**
 * The Studio sends Clerk's own session token to the API. The API's guard reads
 * the role from `public_metadata`, which that token only carries once the
 * instance's session token is customised (Clerk Dashboard, Sessions):
 *
 *   { "public_metadata": "{{user.public_metadata}}" }
 *
 * A token minted from a JWT template on the server has no `azp` claim, and the
 * guard refuses a token without one, so a template cannot be used here.
 */
export const ROLE_CLAIM = "public_metadata";

/** The roles the API lets into the Studio. Anything else is a 403. */
export const STUDIO_ROLES = ["owner", "editor"] as const;
export type StudioRole = (typeof STUDIO_ROLES)[number];

export const STUDIO_HOME = "/studio";
export const SIGN_IN_PATH = "/studio/sign-in";
export const FORBIDDEN_PATH = "/studio/forbidden";

/**
 * Set by the middleware on every Studio request, so the layout knows whether
 * to draw the shell without asking Clerk a second time. The middleware
 * overwrites whatever a browser sends under this name.
 */
export const GATE_HEADER = "x-vows-studio-gate";
export type GateVerdict = "open" | "closed";

/** The query key the 403 screen reads to send the visitor back afterwards. */
export const RETURN_TO_PARAM = "from";

export function albumPath(id: string): string {
  return `${STUDIO_HOME}/albums/${id}`;
}

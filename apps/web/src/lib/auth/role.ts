import { STUDIO_ROLES } from './constants';
import type { StudioRole } from './constants';

function decodeSegment(segment: string): unknown {
  const base64 = segment.replaceAll('-', '+').replaceAll('_', '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

/**
 * Reads the role out of a token Clerk has just minted for this session. The
 * signature is not checked here: this only decides whether to draw the Studio.
 * The API verifies every token itself, and it is the API that guards the data.
 */
export function roleFromToken(token: string | null): StudioRole | null {
  const payload = token?.split('.')[1];
  if (!payload) return null;
  try {
    const claims = decodeSegment(payload) as { public_metadata?: { role?: unknown } } | null;
    const role = claims?.public_metadata?.role;
    return STUDIO_ROLES.find((known) => known === role) ?? null;
  } catch {
    return null;
  }
}

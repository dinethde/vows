import { FORBIDDEN_PATH, SIGN_IN_PATH, STUDIO_HOME } from './constants';
import type { StudioRole } from './constants';

export interface GateInput {
  pathname: string;
  signedIn: boolean;
  role: StudioRole | null;
}

export type GateDecision = 'sign-in' | 'allow' | 'forbid';

function isUnder(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/**
 * Who gets past the Studio's door. The sign-in screen is always reachable. The
 * 403 screen is never a page of its own: asking for it by address is refused
 * like anything else, so it cannot be served with a 200.
 */
export function decide({ pathname, signedIn, role }: GateInput): GateDecision {
  if (isUnder(pathname, SIGN_IN_PATH)) return 'sign-in';
  if (isUnder(pathname, FORBIDDEN_PATH)) return 'forbid';
  return signedIn && role !== null ? 'allow' : 'forbid';
}

/** Sign-in sends the visitor back to the Studio page they asked for, and nowhere else. */
export function signInHref(returnTo: string | undefined): string {
  const inside =
    returnTo !== undefined &&
    isUnder(returnTo.split('?')[0] ?? '', STUDIO_HOME) &&
    !isUnder(returnTo, FORBIDDEN_PATH) &&
    !isUnder(returnTo, SIGN_IN_PATH);
  return `${SIGN_IN_PATH}?redirect_url=${encodeURIComponent(inside ? returnTo : STUDIO_HOME)}`;
}

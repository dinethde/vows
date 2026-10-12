import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
  API_TOKEN_TEMPLATE,
  FORBIDDEN_PATH,
  GATE_HEADER,
  RETURN_TO_PARAM,
} from '@/lib/auth/constants';
import type { GateVerdict } from '@/lib/auth/constants';
import { decide } from '@/lib/auth/gate';
import { roleFromToken } from '@/lib/auth/role';

function withGate(request: NextRequest, verdict: GateVerdict): Headers {
  const headers = new Headers(request.headers);
  headers.set(GATE_HEADER, verdict);
  return headers;
}

/** Nothing in the Studio is ever stored by a browser or a proxy. */
function sealed(response: NextResponse): NextResponse {
  response.headers.set('cache-control', 'private, no-store');
  response.headers.set('x-robots-tag', 'noindex, nofollow');
  return response;
}

/** The 403 screen at the address that was asked for, with a real 403. */
function refuse(request: NextRequest): NextResponse {
  const target = request.nextUrl.clone();
  const asked = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  target.pathname = FORBIDDEN_PATH;
  target.search = '';
  target.searchParams.set(RETURN_TO_PARAM, asked);
  return NextResponse.rewrite(target, {
    status: 403,
    request: { headers: withGate(request, 'closed') },
  });
}

/** A missing template is a setup fault, not a reason to let anyone in. */
async function tokenFor(
  getToken: (options: { template: string }) => Promise<string | null>,
): Promise<string | null> {
  try {
    return await getToken({ template: API_TOKEN_TEMPLATE });
  } catch {
    return null;
  }
}

/**
 * Clerk says who is asking; this decides whether they get in. A signed-out
 * visitor and a signed-in account with no role both get the 403 screen. Nobody
 * is bounced to sign-in without being told why.
 */
export default clerkMiddleware(async (auth, request) => {
  const session = await auth();
  const signedIn = session.userId !== null;
  const token = signedIn ? await tokenFor(session.getToken) : null;
  const decision = decide({
    pathname: request.nextUrl.pathname,
    signedIn,
    role: roleFromToken(token),
  });

  if (decision === 'forbid') return sealed(refuse(request));
  const verdict: GateVerdict = decision === 'allow' ? 'open' : 'closed';
  return sealed(NextResponse.next({ request: { headers: withGate(request, verdict) } }));
});

/** Only the Studio. The public site never passes through here, so it stays static. */
export const config = {
  matcher: ['/studio', '/studio/:path*'],
};

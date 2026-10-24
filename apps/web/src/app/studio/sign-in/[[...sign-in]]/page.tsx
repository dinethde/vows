import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { SIGN_IN_PATH, STUDIO_HOME } from '@/lib/auth/constants';

export const metadata: Metadata = { title: 'Sign in' };

/** Clerk's own screen, left as Clerk draws it. There is no Figma frame for it. */
export default function SignInPage(): ReactElement {
  return (
    <main id="main" className="p-space-5 flex min-h-svh items-center justify-center">
      <SignIn path={SIGN_IN_PATH} fallbackRedirectUrl={STUDIO_HOME} />
    </main>
  );
}

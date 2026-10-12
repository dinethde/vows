import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { PrivateScreen } from '@/components/site/error-pages';
import { MusicProvider } from '@/components/site/music/music-provider';
import { SiteNavbar } from '@/components/site/site-navbar';
import { RETURN_TO_PARAM } from '@/lib/auth/constants';
import { signInHref } from '@/lib/auth/gate';

export const metadata: Metadata = { title: '403' };

export interface ForbiddenPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * The 403 screen. Nobody links here: the middleware shows this in place of any
 * Studio page the visitor may not open, at that page's own address and with a
 * real 403, and tells it where they were going so sign-in can send them back.
 */
export default async function ForbiddenPage({
  searchParams,
}: ForbiddenPageProps): Promise<ReactElement> {
  const from = (await searchParams)[RETURN_TO_PARAM];

  return (
    <MusicProvider>
      <header className="fixed inset-x-0 top-0 z-40">
        <SiteNavbar />
      </header>
      <main id="main" className="flex min-h-svh flex-col justify-center pt-[56px]">
        <PrivateScreen signInHref={signInHref(typeof from === 'string' ? from : undefined)} />
      </main>
    </MusicProvider>
  );
}

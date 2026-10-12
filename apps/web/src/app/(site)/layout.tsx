import type { ReactElement, ReactNode } from 'react';

import { MusicProvider } from '@/components/site/music/music-provider';
import { SiteNavbar } from '@/components/site/site-navbar';

export interface SiteLayoutProps {
  children: ReactNode;
}

/** Every public page: the skip link, the bar on top, and the music above the router. */
export default function SiteLayout({ children }: SiteLayoutProps): ReactElement {
  return (
    <MusicProvider>
      <a
        href="#main"
        className="type-ui-label bg-surface text-primary top-space-2 left-space-2 px-space-4 py-space-2 fixed z-50 -translate-y-[200%] focus:translate-y-0"
      >
        Skip to the content
      </a>
      <header className="fixed inset-x-0 top-0 z-40">
        <SiteNavbar />
      </header>
      {children}
    </MusicProvider>
  );
}

import type { Metadata, Viewport } from 'next';
import type { ReactElement, ReactNode } from 'react';

import { fontVariables } from './fonts';

import { env } from '@/config/env';

import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: { default: 'Vows Weddings', template: '%s · Vows' },
  description: 'Wedding photography in Sri Lanka, since 2013.',
  // Every page has a share card: this one unless the page names its own, as
  // the album pages do (chapter 12).
  openGraph: {
    type: 'website',
    siteName: 'Vows Weddings',
    locale: 'en_LK',
    images: [{ url: '/share/fallback.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): ReactElement {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body>
        {/* Marks the page as scripted before it paints, so a reveal never flashes. */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
        {children}
      </body>
    </html>
  );
}

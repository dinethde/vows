import type { Metadata, Viewport } from 'next';
import type { ReactElement, ReactNode } from 'react';

import { fontVariables } from './fonts';

import { env } from '@/config/env';

import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: { default: 'Vows Weddings', template: '%s · Vows' },
  description: 'Wedding photography in Sri Lanka, since 2013.',
  openGraph: { type: 'website', siteName: 'Vows Weddings', locale: 'en_LK' },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): ReactElement {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}

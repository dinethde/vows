import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { HomeBottomBar } from '@/components/site/home/home-bars';
import { HomeCanvas } from '@/components/site/home/home-canvas';
import { homeTiles } from '@/components/site/home/home-tiles';
import { Loader } from '@/components/site/home/loader';
import { MusicGate } from '@/components/site/home/music-gate';
import { env } from '@/config/env';
import { site } from '@/config/site';

export const metadata: Metadata = {
  title: { absolute: 'Vows Weddings — wedding photography in Sri Lanka' },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: env.SITE_URL,
    images: [{ url: `${env.SITE_URL}/share/fallback.png`, width: 1200, height: 630 }],
  },
};

const business = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: site.name,
  url: env.SITE_URL,
  email: site.email,
  telephone: site.phone,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Wadduwa',
    addressRegion: 'Kalutara',
    addressCountry: 'LK',
  },
  areaServed: 'Sri Lanka',
});

/**
 * The portfolio. No banner and no sections: photographs on one pale canvas,
 * with the studio name held still in the middle. The page itself never
 * scrolls, so there is no footer here.
 */
export default async function HomePage(): Promise<ReactElement> {
  const tiles = await homeTiles();
  return (
    <main id="main" className="bg-page relative h-svh overflow-clip">
      <Loader />
      <MusicGate>
        <HomeCanvas tiles={tiles} />
        <div className="gap-space-2 pointer-events-none absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
          <h1 className="type-heading-2 text-heading whitespace-nowrap">
            {site.name.replace('Vows', 'VOWS')}
          </h1>
          <p className="type-ui-caption text-secondary whitespace-nowrap">{site.tagline}</p>
        </div>
      </MusicGate>
      <HomeBottomBar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: business }} />
    </main>
  );
}

import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';

/** Covers of published albums, going round again if there are fewer than eight. */
async function footerPictures(): Promise<ReactNode[]> {
  const albums = await publicApi().albums.list();
  const covers = albums.flatMap((album) => (album.cover ? [album.cover] : []));
  if (covers.length === 0) return [];
  return Array.from({ length: MAX_FOOTER_PHOTOS }, (_unused, index) => {
    const cover = covers[index % covers.length];
    return cover ? (
      <Photo
        key={`footer-${String(index)}`}
        photo={cover}
        sizes="230px"
        decorative
        className="size-full object-cover"
      />
    ) : null;
  });
}

import { FooterColumns } from './footer-columns';
import { FooterPhotos } from './footer-photos';
import { MAX_FOOTER_PHOTOS } from './footer-photos-layout';
import { FooterStage } from './footer-stage';

import { Photo } from '@/components/site/photo/photo';
import { routes, site } from '@/config/site';
import { publicApi } from '@/lib/api';

/**
 * A full panel, as tall as the screen, sitting behind the page. Three bands:
 * the columns pinned to the top, the legal links pinned to the bottom, and the
 * studio name in whatever is left between them.
 */
export async function SiteFooter(): Promise<ReactElement> {
  const pictures = await footerPictures();
  return (
    <FooterStage>
      <FooterPhotos pictures={pictures} />
      <FooterColumns />
      {/* The name is drawn over the photographs, as in Figma, never under them. */}
      <div className="relative z-10 flex w-full flex-1 items-center justify-center">
        {/* The size follows the window, so the name always fills the width
            with a little air either side. The break on a phone is in the
            markup, so a word is never split. */}
        <h2 className="font-mate tablet:text-[12.6vw] tablet:leading-[1.3] whitespace-nowrap text-center text-[20.5vw] leading-[1.2]">
          VOWS <br className="tablet:hidden" />
          Weddings
        </h2>
      </div>
      <ul className="type-nav-legal tablet:flex tablet:justify-between relative z-10 grid w-full grid-cols-[auto_auto] justify-between gap-y-[10px] [&>*:nth-child(even)]:justify-self-end">
        <li>{site.copyright}</li>
        {site.ratesPdf ? (
          <li>
            <a href={site.ratesPdf}>Rates (PDF)</a>
          </li>
        ) : null}
        <li>
          <Link href={routes.cookies.href}>{routes.cookies.label}</Link>
        </li>
        <li>
          <Link href={routes.privacy.href}>{routes.privacy.label}</Link>
        </li>
      </ul>
    </FooterStage>
  );
}

import Link from 'next/link';
import type { ReactElement } from 'react';

import { FooterColumns } from './footer-columns';
import { FooterStage } from './footer-stage';

import { routes, site } from '@/config/site';

/**
 * A full panel, as tall as the screen, sitting behind the page. Three bands:
 * the columns pinned to the top, the legal links pinned to the bottom, and the
 * studio name in whatever is left between them.
 */
export function SiteFooter(): ReactElement {
  return (
    <FooterStage>
      <FooterColumns />
      <div className="flex w-full flex-1 items-center justify-center">
        {/* The size follows the window, so the name always fills the width
            with a little air either side. The break on a phone is in the
            markup, so a word is never split. */}
        <h2 className="font-mate tablet:text-[12.6vw] tablet:leading-[1.3] whitespace-nowrap text-center text-[20.5vw] leading-[1.2]">
          VOWS <br className="tablet:hidden" />
          Weddings
        </h2>
      </div>
      <ul className="type-nav-legal tablet:flex tablet:justify-between grid w-full grid-cols-[auto_auto] justify-between gap-y-[10px]">
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

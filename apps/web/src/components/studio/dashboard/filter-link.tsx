'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';

import { useDashboardNavigation } from './dashboard-navigation';
import type { FilterLinkProps } from './filter-link.types';

/**
 * A real link to the filtered dashboard. A plain click goes through the
 * dashboard's transition so only the grid waits; a click that opens a new tab
 * or window is left to the browser.
 */
export function FilterLink({ href, current, className, children }: FilterLinkProps): ReactElement {
  const { show } = useDashboardNavigation();

  return (
    <Link
      href={href}
      aria-current={current ? 'true' : undefined}
      className={className}
      onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        show(href, 'push');
      }}
    >
      {children}
    </Link>
  );
}

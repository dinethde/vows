'use client';

import { cn } from '@vows/ui';
import type { ReactElement } from 'react';

import { useDashboardNavigation } from './dashboard-navigation';
import type { GridBusyProps } from './grid-busy.types';

/**
 * The cards, faded while a search, a filter or a refresh is on its way, with
 * a note over them that says so. The rest of the page stays as it was. The
 * status region is always there, so a screen reader hears it change.
 */
export function GridBusy({ children }: GridBusyProps): ReactElement {
  const { pending } = useDashboardNavigation();

  return (
    <div aria-busy={pending || undefined} className="relative flex flex-col">
      <div
        role="status"
        aria-live="polite"
        className="top-space-6 pointer-events-none absolute inset-x-0 z-10 flex justify-center"
      >
        {pending ? (
          <p className="bg-surface shadow-card gap-space-2 px-space-3 py-space-2 type-studio-caption text-muted flex items-center">
            <span
              aria-hidden="true"
              className="rounded-pill border-strong size-space-3 animate-spin border-2 border-t-transparent motion-reduce:animate-none"
            />
            Updating the albums…
          </p>
        ) : null}
      </div>
      <div className={cn('flex flex-col transition-opacity', pending && 'opacity-50')}>
        {children}
      </div>
    </div>
  );
}

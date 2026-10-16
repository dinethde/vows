'use client';

import { BottomBar } from '@vows/ui';
import { useSyncExternalStore } from 'react';
import type { ReactElement } from 'react';

import { barsShown, barsShownOnServer, subscribeToBars } from './bars-store';

import { site } from '@/config/site';

export function useBarsShown(): boolean {
  return useSyncExternalStore(subscribeToBars, barsShown, barsShownOnServer);
}

/** Opacity only. No height, no transform: not one photograph may move when a bar arrives. */
export function barFade(shown: boolean): string {
  return shown
    ? 'opacity-100 transition-opacity duration-500'
    : 'pointer-events-none opacity-0 transition-opacity duration-500';
}

/** The quiet bar along the bottom of the home page. In the markup from the first paint, only faded out. */
export function HomeBottomBar(): ReactElement {
  const shown = useBarsShown();
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 ${barFade(shown)}`}
      {...(shown ? {} : { inert: true })}
    >
      <BottomBar wordmark={site.wordmark} intro={site.intro} since={site.since} />
    </div>
  );
}

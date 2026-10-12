'use client';

import { useSyncExternalStore } from 'react';
import type { ReactElement } from 'react';

export interface EmailLinkProps {
  user: string;
  domain: string;
  className?: string;
}

const subscribe = (): (() => void) => () => undefined;

/**
 * The address is written out in the HTML with " at " in it, and only becomes
 * a mailto link in a real browser. It will not stop a determined scraper; it
 * stops the lazy ones, and a reader with no JavaScript can still read it.
 */
export function EmailLink({ user, domain, className }: EmailLinkProps): ReactElement {
  const inBrowser = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  if (!inBrowser) return <span className={className}>{`${user} at ${domain}`}</span>;
  const address = `${user}@${domain}`;
  return (
    <a href={`mailto:${address}`} className={className}>
      {address}
    </a>
  );
}

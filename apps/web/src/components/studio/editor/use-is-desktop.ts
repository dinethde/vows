import { useSyncExternalStore } from 'react';

/* The same line the `desktop:` variant draws: 64rem, 1024 px. */
const QUERY = '(min-width: 64rem)';

function subscribe(listener: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', listener);
  return () => {
    media.removeEventListener('change', listener);
  };
}

/**
 * Whether the window is at the desktop width. Null on the server and for the
 * first paint, when it cannot be known. The editor draws its 19 slots once,
 * in one of two layouts, and this is how it picks: drawing both and hiding
 * one would load every photograph twice.
 */
export function useIsDesktop(): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => null,
  );
}

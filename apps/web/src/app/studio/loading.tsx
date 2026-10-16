import type { ReactElement } from 'react';

/** Shown while a Studio page is fetching. It says so to a screen reader as well. */
export default function StudioLoading(): ReactElement {
  return (
    <div
      role="status"
      aria-live="polite"
      className="gap-space-3 p-space-8 text-muted flex flex-1 items-center justify-center"
    >
      <span
        aria-hidden="true"
        className="rounded-pill border-strong size-space-4 animate-spin border-2 border-t-transparent motion-reduce:animate-none"
      />
      <p className="type-studio-body-l">Loading the Studio…</p>
    </div>
  );
}

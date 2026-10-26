import type { ReactElement } from "react";

/* The i and the triangle are decoration. The sentence carries the meaning. */

export function InfoGlyph(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="text-muted shrink-0 fill-none stroke-current"
      width="14"
      height="14"
      viewBox="0 0 14 14"
    >
      <circle cx="7" cy="7" r="5.95" strokeWidth="1.1" />
      <rect x="6.4" y="6.2" width="1.2" height="4.6" className="fill-current stroke-none" />
      <circle cx="7" cy="4.2" r="0.8" className="fill-current stroke-none" />
    </svg>
  );
}

export function WarningGlyph(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="text-status-error shrink-0 fill-none stroke-current"
      width="14"
      height="14"
      viewBox="0 0 14 14"
    >
      <path d="M7 2.6L12 11.4H2Z" strokeWidth="1.1" strokeLinejoin="round" />
      <rect x="6.4" y="5.4" width="1.2" height="3" className="fill-current stroke-none" />
      <circle cx="7" cy="9.7" r="0.7" className="fill-current stroke-none" />
    </svg>
  );
}

export function CloseGlyph(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="fill-none stroke-current"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      strokeWidth="1.3"
      strokeLinecap="round"
    >
      <path d="M1 1L13 13M13 1L1 13" />
    </svg>
  );
}

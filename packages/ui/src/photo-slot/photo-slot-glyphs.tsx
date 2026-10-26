import type { ReactElement } from "react";

import { cn } from "../lib/cn";

/* Every glyph is decoration: the slot's button carries the name. */

export function PictureGlyph({ className }: { className?: string }): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className={cn("stroke-(--vows-border-strong) shrink-0", className)}
      width="34"
      height="26"
      viewBox="0 0 34 26"
      fill="none"
    >
      <rect x="0.75" y="0.75" width="32.5" height="24.5" rx="2.25" strokeWidth="1.5" />
      <circle cx="9" cy="7.5" r="3" className="fill-(--vows-border-strong) stroke-none" />
      <path
        d="M10.5 21.5L18.5 12.5L26.5 21.5Z"
        className="fill-(--vows-border-strong) stroke-none"
      />
    </svg>
  );
}

/* A 1.5 stroke with a 6 / 4 dash. A CSS dashed border cannot set the dash. */
export function DashedEdge(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="stroke-(--vows-border-dashed) pointer-events-none absolute inset-0 size-full fill-none"
    >
      <rect
        x="0.75"
        y="0.75"
        className="h-[calc(100%-1.5px)] w-[calc(100%-1.5px)]"
        strokeWidth="1.5"
        strokeDasharray="6 4"
      />
    </svg>
  );
}

/* The ring is decoration. The number beside it is the truth. */
export function ProgressRing(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="shrink-0 animate-spin fill-none stroke-current motion-reduce:animate-none"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <circle
        cx="12"
        cy="12"
        r="10.32"
        strokeWidth="3.36"
        strokeDasharray="46.95 64.84"
        transform="rotate(-90 12 12)"
      />
    </svg>
  );
}

export function WarningGlyph(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="shrink-0 fill-none stroke-current"
      width="22"
      height="20"
      viewBox="0 0 22 20"
    >
      <path d="M11 3.6L18 16H4Z" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="10.2" y="8.2" width="1.6" height="4" rx="0.8" className="fill-current stroke-none" />
      <circle cx="11" cy="13.8" r="0.9" className="fill-current stroke-none" />
    </svg>
  );
}

export function ReplaceGlyph(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="shrink-0 fill-none stroke-current"
      width="15"
      height="15"
      viewBox="0 0 15 15"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M0 3.5H15M11 0L15 3.5L11 7M15 11.5H0M4 8L0 11.5L4 15" />
    </svg>
  );
}

export function CrossGlyph(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="fill-none stroke-current"
      width="8"
      height="8"
      viewBox="0 0 8 8"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M0 0L8 8M8 0L0 8" />
    </svg>
  );
}

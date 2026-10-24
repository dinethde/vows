import type { ReactElement, ReactNode } from 'react';

import { cn } from '../lib/cn';

import type { ErrorScreenCard } from './error-screen.types';

/* The card is drawn once, at the desktop size of 164 × 192, in the units of
 * the Figma frame. The screen scales it; nothing here knows the width.
 *
 * Two soft shadows lift it off the numeral: 0 2 6 at 5.5 per cent and
 * 0 20 44 −6 at 8.5 per cent. No elevation token describes them. */
const card = cn(
  'relative block h-[192px] w-[164px] overflow-hidden rounded-[1.6px]',
  'shadow-[0_2px_6px_0_color-mix(in_srgb,var(--vows-color-ink-900)_5.5%,transparent),0_20px_44px_-6px_color-mix(in_srgb,var(--vows-color-ink-900)_8.5%,transparent)]',
);

/* 500: a light leak across the print, from ink/100 through white and back,
 * deepening towards the two far corners. */
const lightLeak =
  'bg-[linear-gradient(140deg,var(--vows-color-ink-200)_14%,var(--vows-color-ink-100)_36%,var(--vows-color-ink-0)_47%,var(--vows-color-ink-0)_54%,var(--vows-color-ink-100)_66%,var(--vows-color-ink-300)_88%)]';

const surfaces: Record<ErrorScreenCard, string> = {
  empty: 'bg-slot',
  burnt: lightLeak,
  locked: 'bg-surface',
};

const strong = 'stroke-(--vows-border-strong)';
const strongFill = 'fill-(--vows-border-strong) stroke-none';

function Hairline(): ReactElement {
  return (
    <rect
      x="0.4"
      y="0.4"
      width="163.2"
      height="191.2"
      rx="1.2"
      strokeWidth="0.79"
      className="stroke-(--vows-border-hairline)"
    />
  );
}

/* The same picture glyph as the empty `photo_slot` in the Studio. */
function Picture({ y }: { y: number }): ReactElement {
  return (
    <g transform={`translate(64.6 ${String(y)})`}>
      <rect
        x="0.63"
        y="0.63"
        width="33.44"
        height="25.54"
        rx="2.5"
        strokeWidth="1.26"
        className={strong}
      />
      <circle cx="9.3" cy="9" r="2.6" className={strongFill} />
      <path d="M8.5 19.5L16.6 11.2L24.7 19.5Z" className={strongFill} />
    </g>
  );
}

function Empty(): ReactElement {
  return (
    <>
      <rect
        x="0.59"
        y="0.59"
        width="162.82"
        height="190.82"
        rx="1"
        strokeWidth="1.18"
        strokeDasharray="5.5 3.9"
        className="stroke-(--vows-border-dashed)"
      />
      <Picture y={82.7} />
    </>
  );
}

function Burnt(): ReactElement {
  return (
    <>
      <Hairline />
      <Picture y={62.2} />
      <g transform="translate(66.2 118.1)" className="stroke-(--vows-status-error-text)">
        <path d="M15.75 2.2L26.6 20.6H4.9Z" strokeWidth="1.42" strokeLinejoin="round" />
        <rect
          x="15"
          y="8.6"
          width="1.4"
          height="6"
          rx="0.7"
          className="fill-(--vows-status-error-text) stroke-none"
        />
        <circle
          cx="15.8"
          cy="17.2"
          r="0.8"
          className="fill-(--vows-status-error-text) stroke-none"
        />
      </g>
    </>
  );
}

function Locked(): ReactElement {
  return (
    <>
      <Hairline />
      <g
        transform="translate(70.1 66.9)"
        className="stroke-(--vows-text-secondary)"
        strokeWidth="1.42"
      >
        <path d="M5.3 11V8.2A6.5 6.9 0 0 1 18.3 8.2V11" strokeWidth="2.4" />
        <rect x="0.71" y="13.3" width="22.2" height="15.9" rx="2.5" />
        <circle cx="11.8" cy="20.9" r="1.95" className="fill-(--vows-text-secondary) stroke-none" />
      </g>
      <rect
        x="48.8"
        y="118.1"
        width="66.2"
        height="0.8"
        className="fill-(--vows-border-hairline) stroke-none"
      />
      <rect
        x="59.9"
        y="129.2"
        width="44.1"
        height="0.8"
        className="fill-(--vows-border-hairline) stroke-none"
      />
    </>
  );
}

const drawings: Record<ErrorScreenCard, () => ReactElement> = {
  empty: Empty,
  burnt: Burnt,
  locked: Locked,
};

/* A picture fills the print, cropped to it, with the print's hairline over
 * its edge so it still reads as a photograph in a frame. */
const filled = '[&_img]:absolute [&_img]:inset-0 [&_img]:size-full [&_img]:object-cover';

export function ErrorCard({
  variant,
  picture,
  className,
}: {
  variant: ErrorScreenCard;
  picture?: ReactNode;
  className?: string;
}): ReactElement {
  if (picture) {
    return (
      <span className={cn(card, 'bg-slot', filled, className)} data-card={variant}>
        {picture}
        <svg className="absolute inset-0 size-full fill-none" viewBox="0 0 164 192">
          <Hairline />
        </svg>
      </span>
    );
  }
  const Drawing = drawings[variant];

  return (
    <span className={cn(card, surfaces[variant], className)} data-card={variant}>
      <svg className="absolute inset-0 size-full fill-none" viewBox="0 0 164 192">
        <Drawing />
      </svg>
    </span>
  );
}

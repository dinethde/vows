import { Slot } from '@radix-ui/react-slot';
import type { ReactElement } from 'react';

import { cn } from '../lib/cn';
import { focusRing } from '../lib/focus';

import type { ChipProps } from './chip.types';

/* 36 tall as drawn; `before` takes the touch target to 44. */
const base = cn(
  'relative inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap',
  'rounded-pill border px-[14px] py-[6px] type-body-s',
  'transition-colors motion-reduce:transition-none',
  'before:absolute before:inset-x-0 before:-inset-y-space-1',
  'disabled:cursor-not-allowed disabled:opacity-65',
  focusRing,
);

const rest = 'border-hairline text-primary hover:border-strong hover:bg-page';
const chosen = 'border-inverse bg-inverse text-inverse';

export function Chip({
  selected,
  asChild = false,
  className,
  children,
  type = 'button',
  ...props
}: ChipProps): ReactElement {
  const classes = cn(base, selected === true ? chosen : rest, className);

  if (asChild) {
    return (
      <Slot {...props} className={classes} aria-current={selected === true ? 'true' : undefined}>
        {children}
      </Slot>
    );
  }

  return (
    <button {...props} type={type} className={classes} aria-pressed={selected}>
      {children}
    </button>
  );
}

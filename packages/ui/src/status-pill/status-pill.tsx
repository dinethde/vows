import type { ReactElement } from 'react';

import { cn } from '../lib/cn';

import type { StatusPillProps, StatusPillState } from './status-pill.types';

const states: Record<StatusPillState, string> = {
  Published: 'bg-status-success text-status-success',
  Draft: 'bg-field-muted text-secondary',
  Untouched: 'bg-status-warning text-status-warning',
};

/* The word is the state. Colour only repeats it. */
export function StatusPill({ state, className, ...rest }: StatusPillProps): ReactElement {
  return (
    <span
      {...rest}
      className={cn(
        'h-space-6 px-space-2 type-studio-badge inline-flex shrink-0 items-center whitespace-nowrap',
        states[state],
        className,
      )}
    >
      {state}
    </span>
  );
}

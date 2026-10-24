import type { MouseEvent, MouseEventHandler } from 'react';

function swallow(event: MouseEvent): void {
  event.preventDefault();
}

/** The click handler for a control that may be switched off without being
 * `disabled`. With nothing to guard and nothing to run it returns undefined,
 * so a Server Component can render the control without passing a function. */
export function guardedClick<T extends HTMLElement>(
  blocked: boolean,
  onClick: MouseEventHandler<T> | undefined,
): MouseEventHandler<T> | undefined {
  return blocked ? swallow : onClick;
}

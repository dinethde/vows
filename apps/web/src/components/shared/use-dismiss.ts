import { useState } from 'react';
import type { FocusEvent, KeyboardEvent } from 'react';

export interface Dismissable {
  open: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  /** Spread on the element that wraps both the trigger and the panel. */
  rootProps: {
    onBlur: (event: FocusEvent<HTMLElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  };
}

/**
 * A small panel that opens under its trigger: the calendar, the account menu.
 * It closes on Escape and when focus leaves the wrapper, which covers a click
 * elsewhere and a Tab past the end. `onEscape` is where focus goes back to.
 */
export function useDismiss(onEscape?: () => void): Dismissable {
  const [open, setOpen] = useState(false);

  return {
    open,
    show: () => {
      setOpen(true);
    },
    hide: () => {
      setOpen(false);
    },
    toggle: () => {
      setOpen((now) => !now);
    },
    rootProps: {
      onBlur: (event) => {
        // Decided a moment later, from where focus actually landed: a day that
        // is replaced while it holds the focus blurs towards nothing first.
        const root = event.currentTarget;
        window.setTimeout(() => {
          if (!root.contains(document.activeElement)) setOpen(false);
        }, 0);
      },
      onKeyDown: (event) => {
        if (event.key !== 'Escape' || !open) return;
        event.stopPropagation();
        setOpen(false);
        onEscape?.();
      },
    },
  };
}

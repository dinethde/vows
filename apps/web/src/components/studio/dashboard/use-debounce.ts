import { useEffect, useRef } from "react";

export interface Debounce {
  /** Runs `work` once `delay` has passed with nothing newer scheduled. */
  schedule: (work: () => void) => void;
  cancel: () => void;
}

/**
 * One timer, replaced by every newer piece of work. The effect only clears it
 * when the component goes, so nothing runs against a page that has left.
 */
export function useDebounce(delay: number): Debounce {
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const pending = timer;
    return () => {
      window.clearTimeout(pending.current);
    };
  }, []);

  return {
    schedule: (work) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(work, delay);
    },
    cancel: () => {
      window.clearTimeout(timer.current);
    },
  };
}

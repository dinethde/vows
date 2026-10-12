import { useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent, RefObject } from 'react';

import { todayIso } from './calendar';
import type { DatePickerProps } from './date-picker.types';
import { formatDateText, parseDateText } from './date-text';

import { useDismiss } from '@/components/shared/use-dismiss';
import type { Dismissable } from '@/components/shared/use-dismiss';

interface GridFocus {
  day: string;
  /** The grid takes the keyboard focus on the next render. */
  take: boolean;
}

export interface DatePickerState {
  input: RefObject<HTMLInputElement | null>;
  popover: Dismissable;
  /** The day in the box, if the text there is a real date. */
  selected: string | null;
  grid: GridFocus;
  /** Opens the month on focus and on a click. */
  open: () => void;
  onType: (event: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onFocusDay: (iso: string) => void;
  onPick: (iso: string) => void;
}

/**
 * What the date field does, apart from what it looks like. The month follows
 * the text as it is typed. Arrow Down moves into the days. Escape and a pick
 * both close the month and put the focus back in the box, and that return
 * must not open it again.
 */
export function useDatePicker({
  value,
  onChange,
}: Pick<DatePickerProps, 'value' | 'onChange'>): DatePickerState {
  const input = useRef<HTMLInputElement | null>(null);
  const returning = useRef(false);
  const backToBox = (): void => {
    returning.current = true;
    input.current?.focus();
  };
  const popover = useDismiss(backToBox);
  const selected = parseDateText(value);
  const [grid, setGrid] = useState<GridFocus>({ day: selected ?? todayIso(), take: false });

  return {
    input,
    popover,
    selected,
    grid,
    open: () => {
      if (returning.current) {
        returning.current = false;
        return;
      }
      if (!popover.open) setGrid({ day: selected ?? todayIso(), take: false });
      popover.show();
    },
    onType: (event) => {
      const parsed = parseDateText(event.target.value);
      if (parsed) setGrid({ day: parsed, take: false });
      onChange(event.target.value);
    },
    onKeyDown: (event) => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      popover.show();
      setGrid({ day: selected ?? grid.day, take: true });
    },
    onFocusDay: (day) => {
      setGrid({ day, take: true });
    },
    onPick: (iso) => {
      onChange(formatDateText(iso));
      popover.hide();
      backToBox();
    },
  };
}

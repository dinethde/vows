"use client";

import type { KeyboardEvent, ReactElement } from "react";

import { cn } from "@vows/ui";
import { focusRing } from "@/components/shared/focus";
import { fullDate } from "@/lib/format/dates";

import {
  WEEKDAYS,
  dayOfMonth,
  monthTitle,
  monthWeeks,
  moveByKey,
  sameMonth,
  shiftMonths,
} from "./calendar";
import type { CalendarGridProps, DayCellProps, MonthStepProps } from "./date-picker.types";

/* The chevron is 6 × 10 as drawn; the button around it is 44 so a finger can land. */
const step = cn(
  "text-muted relative flex size-[28px] cursor-pointer items-center justify-center rounded-sm",
  "before:absolute before:-inset-2",
  focusRing,
);

function MonthStep({ back, onClick }: MonthStepProps): ReactElement {
  return (
    <button
      type="button"
      className={step}
      aria-label={back ? "Previous month" : "Next month"}
      onClick={onClick}
    >
      <svg aria-hidden="true" width="6" height="10" viewBox="0 0 6 10" fill="none">
        <path
          d={back ? "M5 1 1 5l4 4" : "M1 1l4 4-4 4"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

const cell = cn(
  "type-ui-caption flex size-[36px] cursor-pointer items-center justify-center rounded-sm",
  focusRing,
);

function tone(chosen: boolean, inMonth: boolean): string {
  if (chosen) return "bg-inverse text-inverse";
  return cn("hover:bg-field-muted", inMonth ? "text-heading" : "text-placeholder");
}

/** One day. Only the focused day is in the tab order; the arrows reach the rest. */
function DayCell({ day, active, chosen, inMonth, takeFocus, onPick }: DayCellProps): ReactElement {
  return (
    <div role="gridcell" aria-selected={chosen} className="flex">
      <button
        ref={(node) => {
          if (active && takeFocus) node?.focus();
        }}
        type="button"
        tabIndex={active ? 0 : -1}
        aria-label={fullDate(day)}
        aria-pressed={chosen}
        className={cn(cell, tone(chosen, inMonth))}
        onClick={() => {
          onPick(day);
        }}
      >
        {dayOfMonth(day)}
      </button>
    </div>
  );
}

function WeekdayRow(): ReactElement {
  return (
    <div role="row" className="flex justify-between">
      {WEEKDAYS.map((day) => (
        <span
          key={day.long}
          role="columnheader"
          aria-label={day.long}
          className="type-ui-caption-s text-muted flex h-[24px] w-[36px] items-center justify-center"
        >
          {day.short}
        </span>
      ))}
    </div>
  );
}

/**
 * One month as a grid of days. The arrow keys move a day or a week, Home and
 * End go to the ends of the week, Page Up and Page Down change the month, and
 * Enter or Space chooses the day that has the focus.
 */
export function CalendarGrid(props: CalendarGridProps): ReactElement {
  const { focused, selected, takeFocus, onFocusDay, onPick } = props;
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const next = moveByKey(focused, event.key);
    if (next === null) return;
    event.preventDefault();
    onFocusDay(next);
  };
  const toMonth = (months: number) => (): void => {
    onFocusDay(shiftMonths(focused, months));
  };

  return (
    <div className="gap-space-2 flex flex-col">
      <div className="flex h-[28px] items-center justify-between">
        <MonthStep back onClick={toMonth(-1)} />
        <p aria-live="polite" className="type-ui-label text-heading">
          {monthTitle(focused)}
        </p>
        <MonthStep back={false} onClick={toMonth(1)} />
      </div>
      <div
        role="grid"
        aria-label={monthTitle(focused)}
        className="flex flex-col"
        onKeyDown={onKeyDown}
      >
        <WeekdayRow />
        <div role="rowgroup" className="pt-space-2 flex flex-col gap-[2px]">
          {monthWeeks(focused).map((week) => (
            <div key={week[0]} role="row" className="flex justify-between">
              {week.map((day) => (
                <DayCell
                  key={day}
                  day={day}
                  active={day === focused}
                  chosen={day === selected}
                  inMonth={sameMonth(day, focused)}
                  takeFocus={takeFocus}
                  onPick={onPick}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

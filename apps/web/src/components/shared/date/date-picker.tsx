"use client";

import { Field, cn } from "@vows/ui";

import { useId } from "react";
import type { ReactElement } from "react";

import { CalendarGrid } from "./calendar-grid";
import type { DatePickerProps } from "./date-picker.types";
import { useDatePicker } from "./use-date-picker";

/**
 * A date that can be typed or picked. The box is an ordinary text field; a
 * month opens under it. Typing still works with the month open. Arrow Down
 * moves into the days, Escape closes and returns to the box, and a picked day
 * is written in full: "17 January 2025".
 */
/* Where the month sits under each field, and how wide it is, as Figma draws
 * it: under the Studio's boxed field, and a row's gap below the site's line. */
const PLACE = {
  studio: "top-[66px] w-[283px]",
  site: "top-full mt-space-8 w-[278px]",
} as const;

export function DatePicker(props: DatePickerProps): ReactElement {
  const { label, inputRef, error, surface = "studio" } = props;
  const picker = useDatePicker(props);
  const popoverId = useId();
  const { popover } = picker;

  return (
    <div className="relative flex flex-col" data-month-open={popover.open} {...popover.rootProps}>
      <Field
        {...(surface === "site"
          ? { surface }
          : { surface, multiline: false as const, placeholder: props.placeholder })}
        label={label}
        name={props.name}
        value={props.value}
        required={props.required}
        autoComplete="off"
        aria-haspopup="dialog"
        aria-expanded={popover.open}
        aria-controls={popover.open ? popoverId : undefined}
        aria-describedby={props.describedBy}
        {...(error === undefined ? {} : { error })}
        ref={(node: HTMLInputElement | null) => {
          picker.input.current = node;
          if (typeof inputRef === "function") inputRef(node);
          else if (inputRef) inputRef.current = node;
        }}
        onChange={picker.onType}
        onFocus={() => {
          picker.open();
          props.onFocus?.();
        }}
        onClick={picker.open}
        onBlur={props.onBlur}
        onKeyDown={picker.onKeyDown}
      />
      {popover.open ? (
        <div
          id={popoverId}
          role="dialog"
          aria-label={`Choose the ${label.toLowerCase()}`}
          className={cn(
            "border-hairline bg-surface p-space-3 shadow-card absolute left-0 z-30 flex max-w-full flex-col rounded-md border",
            PLACE[surface],
          )}
          onMouseDown={(event) => {
            // Keeps the focus where it is, so a click on a day is not mistaken
            // for leaving the field in browsers that do not focus a button.
            event.preventDefault();
          }}
        >
          <CalendarGrid
            focused={picker.grid.day}
            selected={picker.selected}
            takeFocus={picker.grid.take}
            onFocusDay={picker.onFocusDay}
            onPick={picker.onPick}
          />
        </div>
      ) : null}
    </div>
  );
}

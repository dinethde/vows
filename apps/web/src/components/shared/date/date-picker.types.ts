import type { Ref } from "react";

export interface DatePickerProps {
  /** Which Figma field draws the box. The Studio's, unless told otherwise. */
  surface?: "site" | "studio";
  /** Marks the field as one that must be filled in. */
  required?: boolean;
  /** The label above the box: "Wedding date". */
  label: string;
  /** What is in the box, as the person typed it or as a picked day is written. */
  value: string;
  /** Called with the new text on every keystroke, and with a date written in
   * full ("17 January 2025") when a day is picked. */
  onChange: (text: string) => void;
  /** Called when focus leaves the box, which is when the text is checked. */
  onBlur?: () => void;
  /** The message under the field. Setting it marks the field as wrong. */
  error?: string;
  placeholder?: string;
  name?: string;
  /** Ids of other elements that describe the field, such as a helper line. */
  describedBy?: string;
  inputRef?: Ref<HTMLInputElement>;
  onFocus?: () => void;
}

export interface MonthStepProps {
  back: boolean;
  onClick: () => void;
}

export interface DayCellProps {
  day: string;
  /** The day the arrow keys are on. */
  active: boolean;
  /** The day in the box. */
  chosen: boolean;
  /** False for the few days of the months either side. */
  inMonth: boolean;
  takeFocus: boolean;
  onPick: (iso: string) => void;
}

export interface CalendarGridProps {
  /** The day that carries the keyboard focus. Its month is the one drawn. */
  focused: string;
  /** The day already chosen, if the text in the box is a real date. */
  selected: string | null;
  /** True for the one render in which the focused day should take the focus. */
  takeFocus: boolean;
  onFocusDay: (iso: string) => void;
  onPick: (iso: string) => void;
}

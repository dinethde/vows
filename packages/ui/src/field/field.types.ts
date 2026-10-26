import type { ComponentProps } from "react";

interface FieldCommonProps {
  /** Site: the placeholder, which is also the accessible name.
   * Studio: the label above the box. */
  label: string;
  /** The message under the field. Setting it puts the field in Figma's
   * `State=Error` and ties the message to the input. */
  error?: string;
  /** Classes for the outer wrapper, not the input. */
  className?: string;
}

type InputProps = Omit<ComponentProps<"input">, "className" | "aria-label" | "prefix">;
type TextareaProps = Omit<ComponentProps<"textarea">, "className" | "aria-label" | "prefix">;

/** `field — site`: no box, and the placeholder is the label. */
export interface SiteFieldProps extends FieldCommonProps, Omit<InputProps, "placeholder"> {
  surface: "site";
}

/** `field — studio`: label above, boxed input, message below. */
export interface StudioInputFieldProps extends FieldCommonProps, InputProps {
  surface: "studio";
  multiline?: false;
  /** Read-only text joined to the left of the box, as on the page-address
   * field. It is read out with the field. */
  prefix?: string;
}

/** `field — studio` as the tall box used for the album story. */
export interface StudioTextareaFieldProps extends FieldCommonProps, TextareaProps {
  surface: "studio";
  multiline: true;
}

export type StudioFieldProps = StudioInputFieldProps | StudioTextareaFieldProps;

export type FieldProps = SiteFieldProps | StudioFieldProps;

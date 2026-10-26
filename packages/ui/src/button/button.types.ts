import type { ComponentProps } from "react";

/** One per Figma component: `button — primary`, `— neutral`, `— outline`,
 * `— danger` and `— nav`. */
export type ButtonVariant = "primary" | "neutral" | "outline" | "danger" | "nav";

export interface ButtonProps extends ComponentProps<"button"> {
  /** Defaults to `primary`. `danger` is only for destroying something. */
  variant?: ButtonVariant;
  /** The request is in flight. The button keeps its focus, shows a ring and
   * ignores presses until this goes back to false. */
  pending?: boolean;
  /** Render the one child instead of a `button`, so the app can pass a link. */
  asChild?: boolean;
}

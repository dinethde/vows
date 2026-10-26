import type { ComponentProps } from "react";

export interface CtaButtonProps extends ComponentProps<"button"> {
  /** The long arrow before the label. On for "Let's talk" and the error pages,
   * off for "Send" in the contact form. Defaults to true. */
  arrow?: boolean;
  /** The request is in flight: a turning ring, the pill at 65 per cent, and
   * presses ignored. The label ("Sending…") is the caller's to change. */
  pending?: boolean;
  /** Render the one child instead of a `button`, so the app can pass a link. */
  asChild?: boolean;
}

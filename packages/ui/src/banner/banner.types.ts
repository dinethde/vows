import type { ComponentProps } from "react";

/** The Figma `State` values of `banner — studio`. */
export type BannerState = "Unsaved" | "Error" | "Saved";

export interface BannerProps extends ComponentProps<"div"> {
  state: BannerState;
  /** The message. It says what to do next, not only what happened. */
  children: ComponentProps<"div">["children"];
}

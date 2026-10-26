import type { ReactElement } from "react";

import { cn } from "../lib/cn";
import type { BannerProps, BannerState } from "./banner.types";

const states: Record<BannerState, string> = {
  Unsaved: "bg-status-warning text-status-warning",
  Error: "bg-status-error text-status-error",
  Saved: "bg-status-success text-status-success",
};

/* A failure interrupts; the other two wait their turn. Keep the banner mounted
 * and change what is inside it, so a screen reader hears the change. */
export function Banner({ state, className, children, ...rest }: BannerProps): ReactElement {
  const failed = state === "Error";

  return (
    <div
      {...rest}
      role={failed ? "alert" : "status"}
      aria-live={failed ? "assertive" : "polite"}
      className={cn(
        "type-studio-label-l flex w-full items-center px-[10px] py-[9px]",
        states[state],
        className,
      )}
    >
      {children}
    </div>
  );
}

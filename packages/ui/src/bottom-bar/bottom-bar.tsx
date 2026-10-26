import type { ReactElement } from "react";

import { bottomBackdrop } from "../lib/bar";
import { cn } from "../lib/cn";
import type { BottomBarProps } from "./bottom-bar.types";

/* 102 tall on a phone, where the paragraph sits above a row holding the
 * wordmark and the year. 72 from the tablet up, with the three on one line.
 * Side padding 20 / 32 / 40. */
const bar = cn(
  "relative isolate grid w-full grid-cols-2 items-center gap-y-space-1 px-space-5 py-space-3 text-primary",
  "tablet:flex tablet:justify-between tablet:gap-[10px] tablet:px-space-7 desktop:px-space-8",
);

export function BottomBar({ wordmark, intro, since, className }: BottomBarProps): ReactElement {
  return (
    <div className={cn(bar, className)}>
      <span aria-hidden="true" className={bottomBackdrop} />
      <span className="type-heading-5 relative">{wordmark}</span>
      <p className="type-body-m tablet:order-none tablet:max-w-[547px] desktop:max-w-[800px] relative order-first col-span-2 text-center">
        <span className="tablet:hidden">{intro.mobile}</span>
        <span className="tablet:inline desktop:hidden hidden">{intro.tablet}</span>
        <span className="desktop:inline hidden">{intro.desktop}</span>
      </p>
      <span className="type-body-m tablet:w-min relative justify-self-end text-center">
        {since}
      </span>
    </div>
  );
}

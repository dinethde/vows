"use client";

import { Banner } from "@vows/ui";

import type { ReactElement } from "react";

import { useEditor } from "./editor-context";

/**
 * The one strip above the form. The wrapper is always in the page, so when a
 * strip appears inside it a screen reader hears it: the green one politely,
 * the red one at once.
 */
export function FormBanner(): ReactElement {
  const { banner } = useEditor();
  return (
    <div aria-live="polite" className="flex flex-col empty:hidden">
      {banner ? <Banner state={banner.state}>{banner.text}</Banner> : null}
    </div>
  );
}

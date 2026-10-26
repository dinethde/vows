"use client";

import { usePathname } from "next/navigation";

import type { ReactElement } from "react";

import { barFade, useBarsShown } from "./home/home-bars";
import { SiteNavbar } from "./site-navbar";

/**
 * The bar on top of every public page. On the home page it holds back until
 * the visitor first moves the canvas, so the first thing anyone sees is
 * photography and nothing else.
 */
export function SiteHeader(): ReactElement {
  const shown = useBarsShown();
  const held = usePathname() === "/" && !shown;
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 ${barFade(!held)}`}
      {...(held ? { inert: true } : {})}
    >
      <SiteNavbar />
    </header>
  );
}

import { useRef } from "react";
import { Outlet, createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "~/components/site-footer";
import { useNavHide } from "~/hooks/use-nav-hide";

/**
 * The layout every content page inherits (DESIGN.md §13.1).
 *
 * Pathless — the leading underscore means `/_site/albums/$slug` is served at
 * `/albums/$slug` — so routes opt in by filename and get the footer without
 * importing it. About, Contact and Pricing will be `_site.about.tsx` and so on.
 *
 * The home page is deliberately outside this layout. It is an infinite 2D pan
 * canvas with no bottom: there is nothing for a footer to sit below, and a
 * fixed one would fight the canvas. Do not move `index.tsx` under `_site`.
 *
 * The layout also owns the navbar's one exception (§13.9): because the footer
 * is a full screen of its own, the bar steps aside for it. Mounting that here
 * rather than in the navbar is what keeps the behaviour tied to the footer —
 * a page without one never gets it.
 */
export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  const footerRef = useRef<HTMLElement>(null);
  useNavHide(footerRef);

  return (
    <>
      <Outlet />
      <SiteFooter ref={footerRef} />
    </>
  );
}

import { Outlet, createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "~/components/site-footer";

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
 */
export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  return (
    <>
      <Outlet />
      <SiteFooter />
    </>
  );
}

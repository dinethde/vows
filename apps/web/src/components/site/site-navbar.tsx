"use client";

import { Navbar, Player } from "@vows/ui";
import Link from "next/link";

import type { ReactElement } from "react";

import { routes, site } from "@/config/site";

import { useMusic } from "./music/music-provider";

export interface SiteNavbarProps {
  className?: string;
}

/** The bar on every public page. The player in it is the only music control. */
export function SiteNavbar({ className }: SiteNavbarProps): ReactElement {
  const { playing, toggle } = useMusic();
  return (
    <Navbar
      home={routes.home}
      contact={routes.contact}
      cta={routes.chat}
      linkComponent={Link}
      player={<Player playing={playing} onToggle={toggle} track={site.track} />}
      {...(className ? { className } : {})}
    />
  );
}

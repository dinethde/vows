import type { ReactNode } from "react";

import type { LinkComponent } from "../lib/link.types";

export interface NavbarLink {
  label: string;
  href: string;
}

export interface NavbarProps {
  /** The wordmark on the left: "VOWS", linking to the home page. */
  home: NavbarLink;
  /** The one text link, kept at every width. */
  contact?: NavbarLink;
  /** `button — nav`, the white pill. Hidden below the tablet width so the
   * player can sit in the true centre. */
  cta?: NavbarLink;
  /** `player — nav`. It is centred on the bar itself, not spaced between the
   * things either side of it. */
  player?: ReactNode;
  /** The 500 page: the wordmark alone. Nothing here can depend on a call
   * that may be the thing that failed. */
  minimal?: boolean;
  /** The app's router link, such as `next/link`. Defaults to `a`. */
  linkComponent?: LinkComponent;
  className?: string;
}

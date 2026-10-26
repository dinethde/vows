import type { ElementType, ReactNode } from "react";

/** What a link has to accept. `next/link` fits, and so does a plain `a`. */
export interface LinkComponentProps {
  href: string;
  className?: string;
  children?: ReactNode;
}

/** The app passes its router's link in, so this package never learns a route. */
export type LinkComponent = ElementType<LinkComponentProps>;

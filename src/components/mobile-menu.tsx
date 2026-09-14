import type * as React from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import { ChatCta } from "~/components/chat-cta";
import { MenuButton } from "~/components/menu-button";
import { copy } from "~/data/copy";

/**
 * The links layer Figma keeps hidden in the mobile navbar, given the overlay it
 * is annotated as moving into (DESIGN.md §3.9). Radix supplies focus trapping,
 * Esc-to-close and scroll lock.
 */
export function MobileMenu({
  open,
  onOpenChange,
  returnFocusTo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The hamburger. Radix has no trigger to restore to — the menu is
      controlled — so closing hands focus back explicitly. */
  returnFocusTo?: React.RefObject<HTMLElement | null>;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-menu-panel=""
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusTo?.current?.focus();
        }}
        className="px-xl pt-4xl pb-xl"
        aria-describedby="vows-menu-description"
      >
        <SheetTitle className="sr-only-focusable">
          {copy.a11y.menuTitle}
        </SheetTitle>
        <SheetDescription
          id="vows-menu-description"
          className="sr-only-focusable"
        >
          {copy.a11y.canvasHint}
        </SheetDescription>

        {/* The navbar's hamburger sits under the panel once it is open, so the
            close control is repeated here, on the same baseline. */}
        <SheetClose asChild>
          <MenuButton
            open
            onClick={() => onOpenChange(false)}
            className="absolute top-xs right-xl"
          />
        </SheetClose>

        <nav className="flex flex-1 flex-col gap-xl">
          {copy.nav.map((link) => (
            <a
              key={link.href}
              className="font-serif text-h5 text-ink transition-opacity
                duration-[var(--duration-fast)] ease-hover
                hover:opacity-[var(--hover-link-opacity)]"
              href={link.href}
              onClick={() => onOpenChange(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <ChatCta className="self-start" />
      </SheetContent>
    </Sheet>
  );
}

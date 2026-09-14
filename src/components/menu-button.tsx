import { forwardRef } from "react";
import type * as React from "react";

import { copy } from "~/data/copy";
import { cn } from "~/lib/utils";

/** The three-rule hamburger drawn in the mobile frames (DESIGN.md §3.7). */
type MenuButtonProps = {
  open: boolean;
  onClick: () => void;
  className?: string;
} & Omit<React.ComponentProps<"button">, "onClick">;

export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(
  function MenuButton({ open, onClick, className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        {...props}
        className={cn("vows-menu-button relative size-2xl shrink-0", className)}
        aria-expanded={open}
        aria-label={open ? copy.a11y.menuClose : copy.a11y.menuOpen}
        onClick={onClick}
      >
        <span className="vows-menu-rule vows-menu-rule-1" />
        <span className="vows-menu-rule vows-menu-rule-2" />
        <span className="vows-menu-rule vows-menu-rule-3" />
      </button>
    );
  },
);

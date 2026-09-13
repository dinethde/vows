import { copy } from "~/data/copy";
import { cn } from "~/lib/utils";

/** The three-rule hamburger drawn in the mobile frames (DESIGN.md §3.7). */
export function MenuButton({
  open,
  onClick,
  className,
}: {
  open: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "vows-menu-button relative size-2xl shrink-0",
        className,
      )}
      aria-expanded={open}
      aria-label={open ? copy.a11y.menuClose : copy.a11y.menuOpen}
      onClick={onClick}
    >
      <span className="vows-menu-rule vows-menu-rule-1" />
      <span className="vows-menu-rule vows-menu-rule-2" />
      <span className="vows-menu-rule vows-menu-rule-3" />
    </button>
  );
}

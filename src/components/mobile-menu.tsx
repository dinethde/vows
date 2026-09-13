import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import { ChatCta } from "~/components/chat-cta";
import { copy } from "~/data/copy";

/**
 * The links layer Figma keeps hidden in the mobile navbar, given the overlay it
 * is annotated as moving into (DESIGN.md §3.9). Radix supplies focus trapping,
 * Esc-to-close and scroll lock.
 */
export function MobileMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-menu-panel=""
        className="px-xl pt-4xl pb-xl"
        aria-describedby="vows-menu-description"
      >
        <SheetTitle className="sr-only-focusable">
          {copy.a11y.menuTitle}
        </SheetTitle>
        <SheetDescription id="vows-menu-description" className="sr-only-focusable">
          {copy.a11y.canvasHint}
        </SheetDescription>

        <nav className="flex flex-1 flex-col gap-xl">
          {copy.nav.map((link) => (
            <a
              key={link.href}
              className="text-h5 font-serif text-ink transition-opacity duration-[var(--duration-fast)] ease-hover hover:opacity-[var(--hover-link-opacity)]"
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

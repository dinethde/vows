import { useCallback, useRef, useState } from "react";

import { ChatCta } from "~/components/chat-cta";
import { MenuButton } from "~/components/menu-button";
import { MobileMenu } from "~/components/mobile-menu";
import { copy } from "~/data/copy";

/**
 * DESIGN.md §3.7. One DOM tree, three layouts:
 *   desktop  justify-between, 62px gutter
 *   tablet   wordmark left, links absolutely centred, CTA right, 24px gutter
 *   mobile   wordmark left, hamburger right, 20px gutter
 */
export function SiteHeader({ revealed }: { revealed: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const onOpenChange = useCallback((open: boolean) => setMenuOpen(open), []);

  return (
    <>
      <header
        id="vows-nav"
        data-chrome="top"
        data-revealed={revealed}
        {...(revealed ? {} : { inert: true })}
        className="vows-chrome chrome-bar top-0 flex h-[var(--bar-top-h)] items-center
          justify-between px-[var(--gutter-top)] backdrop-blur-[var(--blur-chrome-top)]"
      >
        <a
          className="flex shrink-0 items-center px-xs py-3xs font-serif text-h5 text-ink
            transition-opacity duration-[var(--duration-fast)] ease-hover
            hover:opacity-[var(--hover-link-opacity)]"
          href="/"
        >
          {copy.wordmark}
        </a>

        <nav
          aria-label="Primary"
          className="hidden shrink-0 items-center gap-md md:flex mid:absolute mid:left-1/2
            mid:-translate-x-1/2"
        >
          {copy.nav.map((link) => (
            <a
              key={link.href}
              className="flex w-[var(--nav-link-w)] items-center justify-center px-xs py-3xs
                font-serif text-body text-ink transition-opacity duration-[var(--duration-fast)]
                ease-hover hover:opacity-[var(--hover-link-opacity)]"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <ChatCta className="hidden py-[var(--cta-pad-y)] md:inline-flex" />

        <MenuButton
          ref={triggerRef}
          className="md:hidden"
          open={menuOpen}
          onClick={() => onOpenChange(!menuOpen)}
        />
      </header>

      <MobileMenu
        open={menuOpen}
        onOpenChange={onOpenChange}
        returnFocusTo={triggerRef}
      />
    </>
  );
}

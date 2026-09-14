import { ChatCta } from "~/components/chat-cta";
import { copy } from "~/data/copy";

/**
 * DESIGN.md §3.8. Three zones in one row on desktop and tablet; two stacked
 * rows on mobile, where the CTA also floats just above the bar.
 *
 * The wordmark and "Since 2013" appear twice in the markup — once for the
 * single-row layout, once for the stacked one. Only ever one is displayed, and
 * swapping `display` is cheaper and far easier to read than reordering four
 * flex children across three breakpoints.
 */
export function SiteFooterBar({ revealed }: { revealed: boolean }) {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0
          bottom-[calc(var(--bar-bottom-h)+var(--floating-cta-offset))] z-[var(--z-chrome)] flex
          justify-center md:hidden"
      >
        <ChatCta
          data-chrome="bottom"
          data-revealed={revealed}
          {...(revealed ? {} : { inert: true })}
          className="vows-chrome pointer-events-auto py-[var(--cta-pad-y)]"
        />
      </div>

      <footer
        data-chrome="bottom"
        data-revealed={revealed}
        {...(revealed ? {} : { inert: true })}
        className="vows-chrome chrome-bar bottom-0 flex h-[var(--bar-bottom-h)] flex-col
          justify-center px-[var(--gutter-bottom)] backdrop-blur-[var(--blur-chrome-bottom)]
          md:flex-row md:items-center md:justify-between"
      >
        <p className="hidden shrink-0 items-center px-lg py-xs font-serif text-h5 text-ink md:flex">
          {copy.wordmark}
        </p>

        <p
          className="flex w-[var(--bar-blurb-w)] shrink-0 items-center justify-center px-lg py-xs
            text-center font-serif text-bar-sm text-ink md:text-bar"
        >
          {copy.bottomBar.blurb}
        </p>

        <p
          className="hidden shrink-0 items-center px-lg py-xs text-center font-serif text-bar
            text-ink md:flex"
        >
          <span>
            {copy.bottomBar.sinceLines[0]}
            <br />
            {copy.bottomBar.sinceLines[1]}
          </span>
        </p>

        <div className="flex items-center justify-between md:hidden">
          <p className="flex shrink-0 items-center px-lg py-xs font-serif text-h5 text-ink">
            {copy.wordmark}
          </p>
          <p className="flex shrink-0 items-center px-lg py-xs font-serif text-bar text-ink">
            {copy.bottomBar.sinceInline}
          </p>
        </div>
      </footer>
    </>
  );
}

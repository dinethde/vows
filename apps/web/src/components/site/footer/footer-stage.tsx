"use client";

import { createContext, use, useEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";

export interface FooterStageProps {
  children: ReactNode;
}

const Revealed = createContext(false);

/** True once the page has slid fully off the footer. The falling photographs start on it. */
export function useFooterRevealed(): boolean {
  return use(Revealed);
}

/**
 * The footer is sticky at the bottom and the page slides up off it, so the
 * footer's own box is "in view" long before anyone can see it: the browser
 * does not know the page covers it. The cue is the end of the page instead —
 * a marker just above the footer. Once that marker has gone above the top of
 * the window, the page has slid away and only the footer is showing. Then the
 * panel turns blue and the photographs fall, once per visit to the page.
 */
export function FooterStage({ children }: FooterStageProps): ReactElement {
  const end = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  // A real subscription to something outside React: the scroll position.
  useEffect(() => {
    const marker = end.current;
    if (!marker || revealed) return;
    let frame = 0;
    const check = (): void => {
      frame = 0;
      // One pixel of slack for fractional scroll positions.
      if (marker.getBoundingClientRect().top <= 1) setRevealed(true);
    };
    const onScroll = (): void => {
      if (frame === 0) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [revealed]);

  // The top padding is the page margin plus the 56 of the bar, which stays on
  // top of the footer. Figma draws the footer without the bar over it.
  return (
    <>
      <div ref={end} aria-hidden="true" data-page-end />
      <footer
        data-revealed={revealed}
        className="group/footer bg-page text-primary data-[revealed=true]:bg-accent data-[revealed=true]:text-inverse p-space-5 tablet:p-space-7 desktop:p-space-8 desktop:pt-[96px] tablet:pt-[88px] sticky bottom-0 z-0 flex min-h-svh flex-col items-center overflow-clip rounded-t-[24px] pt-[76px] transition-colors duration-500 ease-out [@media(max-height:620px)]:static"
      >
        <Revealed value={revealed}>{children}</Revealed>
      </footer>
    </>
  );
}

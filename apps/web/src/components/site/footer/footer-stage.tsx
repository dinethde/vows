'use client';

import { createContext, use, useEffect, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

export interface FooterStageProps {
  children: ReactNode;
}

const Revealed = createContext(false);

/** True once the footer has been fully uncovered. The falling photographs start on it. */
export function useFooterRevealed(): boolean {
  return use(Revealed);
}

/** How much of the footer has to be in view before it counts as uncovered. */
const UNCOVERED = 0.95;

/**
 * The footer never moves; the page slides off it. So the cue is how much of it
 * can be seen. Once it is fully uncovered the panel turns blue, once per visit
 * to the page, and stays that way.
 */
export function FooterStage({ children }: FooterStageProps): ReactElement {
  const panel = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  // A real subscription to something outside React: the viewport.
  useEffect(() => {
    const element = panel.current;
    if (!element || revealed) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.intersectionRatio >= UNCOVERED) setRevealed(true);
      },
      { threshold: UNCOVERED },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [revealed]);

  // The top padding is the page margin plus the 56 of the bar, which stays on
  // top of the footer. Figma draws the footer without the bar over it.
  return (
    <footer
      ref={panel}
      data-revealed={revealed}
      className="group/footer bg-page text-primary data-[revealed=true]:bg-accent data-[revealed=true]:text-inverse p-space-5 tablet:p-space-7 desktop:p-space-8 desktop:pt-[96px] tablet:pt-[88px] sticky bottom-0 z-0 flex min-h-svh flex-col items-center overflow-clip rounded-t-[24px] pt-[76px] transition-colors duration-500 ease-out [@media(max-height:620px)]:static"
    >
      <Revealed value={revealed}>{children}</Revealed>
    </footer>
  );
}

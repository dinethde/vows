"use client";

import { useEffect, useRef } from "react";
import type { ReactElement, ReactNode } from "react";

import { FloatEngine } from "@/lib/motion/float-engine";

export interface FloatGroupProps {
  children: ReactNode;
  className?: string;
}

/** How much of a photograph has to be on screen before it arrives. */
const ARRIVED = 0.15;

/**
 * Reveal and float as one system. Anything marked `data-reveal` fades and
 * lifts into place once, the first time it is seen, and never again. Anything
 * marked `data-float` inside it then drifts. The stylesheet does the reveal;
 * with reduced motion, or with no script at all, everything is simply there.
 */
export function FloatGroup({ children, className }: FloatGroupProps): ReactElement {
  const group = useRef<HTMLDivElement>(null);

  // The viewport and the pointer: both outside React.
  useEffect(() => {
    const element = group.current;
    if (!element) return;
    const engine = new FloatEngine();
    for (const item of element.querySelectorAll<HTMLElement>("[data-float]")) engine.add(item);

    const arrivals = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "true";
          arrivals.unobserve(entry.target);
        }
      },
      { threshold: ARRIVED },
    );
    for (const item of element.querySelectorAll("[data-reveal]")) arrivals.observe(item);

    return () => {
      arrivals.disconnect();
      engine.destroy();
    };
  }, []);

  return (
    <div ref={group} className={className}>
      {children}
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import gsap from "gsap";

import { AmbiencePlayer } from "~/components/ambience-player";
import { GalleryCanvas } from "~/components/gallery-canvas";
import { LoadingScreen } from "~/components/loading-screen";
import { HeroTitle } from "~/components/hero-title";
import { SiteHeader } from "~/components/site-header";
import { SiteFooterBar } from "~/components/site-footer-bar";
import { SkipLink } from "~/components/skip-link";
import { useAmbience } from "~/hooks/use-ambience";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { readMotion } from "~/lib/motion";
import { copy } from "~/data/copy";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const reducedMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  const ambience = useAmbience();

  // `start` changes identity whenever playback state does, so it is reached
  // through a ref: onFirstPan has to stay stable or the canvas rebuilds its
  // input handlers in the middle of the very gesture that called it.
  const startRef = useRef(ambience.start);
  startRef.current = ambience.start;

  // The first pan is the visitor's first gesture, which is both the chrome's
  // reveal trigger and the only moment a browser will let audio start.
  const onFirstPan = useCallback(() => {
    setRevealed(true);
    startRef.current();
  }, []);

  // ---- hero entrance (DESIGN.md §5.2 #2) --------------------------------
  // Targets are selected rather than wrapped in a ref'd div: both the hero and
  // the bars are position: fixed, and a transformed wrapper would become their
  // containing block and break the centring.
  useEffect(() => {
    const motion = readMotion();
    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.fromTo(
          ".vows-hero",
          { opacity: 0 },
          { opacity: 1, duration: motion["motion-base"], ease: "none" },
        );
        return;
      }
      gsap.fromTo(
        ".vows-hero",
        { opacity: 0, y: motion["hero-entrance-y"] },
        {
          opacity: 1,
          y: 0,
          duration: motion["motion-entrance"],
          delay: motion["motion-instant"],
          ease: "power4.out",
        },
      );
    });
    return () => context.revert();
  }, [reducedMotion]);

  // ---- chrome reveal (DESIGN.md §5.2 #3) --------------------------------
  useEffect(() => {
    if (!revealed) return;
    const motion = readMotion();

    const context = gsap.context(() => {
      const top = '[data-chrome="top"]';
      const bottom = '[data-chrome="bottom"]';

      if (reducedMotion) {
        gsap.to([top, bottom], {
          opacity: 1,
          duration: motion["motion-base"],
          ease: "none",
        });
        return;
      }

      gsap
        .timeline()
        .fromTo(
          top,
          { opacity: 0, y: -motion["chrome-reveal-y"] },
          {
            opacity: 1,
            y: 0,
            duration: motion["motion-slow"],
            ease: "power4.out",
          },
        )
        .fromTo(
          bottom,
          { opacity: 0, y: motion["chrome-reveal-y"] },
          {
            opacity: 1,
            y: 0,
            duration: motion["motion-slow"],
            ease: "power4.out",
          },
          motion["stagger-chrome"],
        );
    });

    return () => context.revert();
  }, [revealed, reducedMotion]);

  return (
    <>
      <SkipLink />
      <GalleryCanvas onFirstPan={onFirstPan} />
      <HeroTitle />
      <SiteHeader revealed={revealed} />
      <SiteFooterBar revealed={revealed} />
      <AmbiencePlayer
        revealed={revealed}
        status={ambience.status}
        onToggle={ambience.toggle}
        track={ambience.track}
        audioRef={ambience.audioRef}
      />

      <p aria-live="polite" className="sr-only-focusable">
        {revealed ? copy.a11y.chromeRevealed : ""}
      </p>

      <LoadingScreen />
    </>
  );
}

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";

import { AlbumPhoto } from "~/components/album/album-photo";
import { useBreakpoint } from "~/hooks/use-breakpoint";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { readMotion } from "~/lib/motion";
import { layoutGallery, DESIGN_WIDTH } from "~/data/album-layout";
import type { Album } from "~/data/albums";

/**
 * The gallery (DESIGN.md §12.4).
 *
 * Placement comes from walking the arrangement sequence with this album's
 * photograph list — there are no fixed positions here, so a shorter or longer
 * album lays out on the same rules.
 *
 * Two motions run, and they are deliberately separate systems:
 *   scroll reveal — one shot per photograph as it comes into view, which is
 *                   what sets the page's pace;
 *   idle float    — a continuous drift on its own offset and period, so no two
 *                   photographs move in step and the page stays alive when the
 *                   visitor stops scrolling.
 */
function subscribeToViewport(onChange: () => void) {
  window.addEventListener("resize", onChange);
  window.addEventListener("orientationchange", onChange);
  return () => {
    window.removeEventListener("resize", onChange);
    window.removeEventListener("orientationchange", onChange);
  };
}

export function AlbumGallery({ album }: { album: Album }) {
  const breakpoint = useBreakpoint();
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  // Read on the same schedule as the breakpoint, not in an effect. Seeded to
  // the design width and corrected after paint, the first painted frames laid
  // a 1440px column out inside a 390px page — 525px of horizontal overflow,
  // sustained well past the first frame, with the gallery visibly snapping
  // into place. `useSyncExternalStore` gives the first client render the real
  // width, so there is nothing to correct.
  const viewportWidth = useSyncExternalStore(
    subscribeToViewport,
    () => window.innerWidth,
    () => DESIGN_WIDTH,
  );

  const layout = useMemo(
    () => layoutGallery(album.photos.length, breakpoint, viewportWidth),
    [album.photos.length, breakpoint, viewportWidth],
  );

  // ---- scroll reveal ----------------------------------------------------
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const motion = readMotion();
    const targets = Array.from(
      root.querySelectorAll<HTMLElement>("[data-album-reveal]"),
    );
    if (!targets.length) return;

    gsap.set(targets, reducedMotion ? { opacity: 0 } : { opacity: 0, y: motion["album-reveal-y"] });

    // A photograph reveals once, when it first comes into view, and is then
    // released — re-revealing on the way back up would fight the float.
    let pending: HTMLElement[] = [];
    let frame = 0;

    const flush = () => {
      frame = 0;
      if (!pending.length) return;
      const batch = pending;
      pending = [];
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: motion["album-reveal-dur"],
        ease: "power3.out",
        stagger: reducedMotion ? 0 : motion["album-reveal-stagger"],
        overwrite: "auto",
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          pending.push(entry.target as HTMLElement);
        }
        if (pending.length && !frame) frame = requestAnimationFrame(flush);
      },
      {
        rootMargin: `0% 0% -${motion["album-reveal-margin"]}% 0%`,
        threshold: 0.01,
      },
    );

    for (const target of targets) observer.observe(target);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      gsap.killTweensOf(targets);
    };
  }, [album.slug, breakpoint, reducedMotion, layout.slots.length]);

  // ---- idle float -------------------------------------------------------
  useEffect(() => {
    if (reducedMotion) return;
    const root = rootRef.current;
    if (!root) return;

    const motion = readMotion();
    const amplitude =
      breakpoint === "desktop"
        ? motion["album-float-amp"]
        : motion["album-float-amp-compact"];

    const tiles = Array.from(
      root.querySelectorAll<HTMLElement>("[data-album-photo]"),
    ).map((el) => {
      const index = Number(el.dataset.albumPhoto);
      return {
        setX: gsap.quickSetter(el, "x", "px") as (v: number) => void,
        setY: gsap.quickSetter(el, "y", "px") as (v: number) => void,
        // A full-bleed photograph is exactly as wide as the viewport, so any
        // sideways drift would expose the ground at one edge and give the page
        // a horizontal scrollbar. It floats vertically only.
        horizontal: !("albumFullbleed" in el.dataset),
        // Its own offset and period, so no two drift in step.
        phase: index * 1.9,
        period:
          motion["album-float-period"] +
          ((index * 7) % 5) * (motion["album-float-jitter"] / 5),
      };
    });
    if (!tiles.length) return;

    const start = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      for (const tile of tiles) {
        const turn = (elapsed / tile.period) * Math.PI * 2;
        if (tile.horizontal) {
          tile.setX(Math.sin(turn + tile.phase) * amplitude * 0.6);
        }
        tile.setY(Math.cos(turn * 0.8 + tile.phase) * amplitude);
      }
    };

    gsap.ticker.add(tick);
    tick();
    return () => {
      gsap.ticker.remove(tick);
      for (const tile of tiles) {
        tile.setX(0);
        tile.setY(0);
      }
    };
  }, [album.slug, breakpoint, reducedMotion, layout.slots.length]);

  const isDesktop = breakpoint === "desktop";

  // Between 1200 and 1440 the Figma column is wider than the viewport. Rather
  // than re-placing every photograph, the whole column scales down, which keeps
  // the transcribed proportions exactly and makes the full-bleed slot land on
  // the viewport edges for free. At and above 1440 it is 1 : 1.
  const scale = isDesktop ? Math.min(1, viewportWidth / DESIGN_WIDTH) : 1;

  const column = (
    <div
      ref={rootRef}
      className="vows-album-gallery relative"
      style={
        isDesktop
          ? {
              position: "absolute",
              left: "50%",
              width: `${DESIGN_WIDTH}px`,
              marginLeft: `${-DESIGN_WIDTH / 2}px`,
              height: `${layout.height}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top center",
            }
          : { width: "100%", height: `${layout.height}px` }
      }
    >
      {layout.slots.map((slot) => {
        const id = album.photos[slot.photoIndex];
        if (!id) return null;
        return (
          <AlbumPhoto
            key={`${slot.photoIndex}-${breakpoint}`}
            id={id}
            family={slot.family}
            width={slot.w}
            height={slot.h}
            index={slot.photoIndex}
            fullBleed={slot.fullBleed}
            style={{ left: `${slot.x}px`, top: `${slot.y}px` }}
          />
        );
      })}
    </div>
  );

  if (!isDesktop) return column;

  return (
    <div
      className="vows-album-frame relative w-full"
      style={{ height: `${layout.height * scale}px` }}
    >
      {column}
    </div>
  );
}

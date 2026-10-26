"use client";

import { useEffect, useRef } from "react";
import type { ReactElement, ReactNode } from "react";

import { prefersReducedMotion } from "@/lib/motion/float";
import { FloatEngine } from "@/lib/motion/float-engine";

import { FALL_MS, fallKeyframes, staggers } from "./fall";
import { footerPhotosCss } from "./footer-photos-layout";
import { useFooterRevealed } from "./footer-stage";

export interface FooterPhotosProps {
  /** Up to eight pictures. Decoration: they carry no description and take no focus. */
  pictures: ReactNode[];
}

/**
 * Once the footer has turned blue, a few photographs drop in from above it,
 * bounce and come to rest, then float like the ones on the home page. They are
 * clipped to the footer, live in its middle band, and with reduced motion they
 * are simply in their places.
 */
export function FooterPhotos({ pictures }: FooterPhotosProps): ReactElement {
  const field = useRef<HTMLDivElement>(null);
  const revealed = useFooterRevealed();

  // An animation started by the footer being uncovered, then a float loop: outside React.
  useEffect(() => {
    const element = field.current;
    if (!element || !revealed) return;
    const photos = [...element.querySelectorAll<HTMLElement>("[data-footer-photo]")];
    const engine = new FloatEngine();
    const land = (photo: HTMLElement): void => {
      photo.style.opacity = "1";
      const inner = photo.firstElementChild;
      if (inner instanceof HTMLElement) engine.add(inner);
    };
    if (prefersReducedMotion()) {
      photos.forEach(land);
      return () => {
        engine.destroy();
      };
    }
    const delays = staggers(photos.length);
    const falls = photos.map((photo, index) => {
      const rotation = getComputedStyle(photo).getPropertyValue("--rest") || "0deg";
      const dropFrom = photo.offsetTop + photo.offsetHeight + 80;
      const fall = photo.animate(fallKeyframes(dropFrom, rotation), {
        duration: FALL_MS,
        delay: delays[index] ?? 0,
        fill: "backwards",
      });
      fall.addEventListener("finish", () => {
        land(photo);
      });
      return fall;
    });
    return () => {
      for (const fall of falls) fall.cancel();
      engine.destroy();
    };
  }, [revealed]);

  // The field starts under the bar, as the columns do, so a photograph lands
  // below the contact details and not on them.
  return (
    <div
      ref={field}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 top-[56px]"
    >
      <style>{footerPhotosCss()}</style>
      {pictures.map((picture, index) => (
        <div
          // The same photograph may appear more than once, so its place is its identity.
          key={`footer-photo-${String(index)}`}
          data-footer-photo
          className={`fp-${String(index)} absolute opacity-0 [transform:translate3d(-50%,-50%,0)_rotate(var(--rest))]`}
        >
          <div className="size-full overflow-clip rounded-md will-change-transform">{picture}</div>
        </div>
      ))}
    </div>
  );
}

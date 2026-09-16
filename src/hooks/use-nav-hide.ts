import { useEffect, type RefObject } from "react";

import { readMotion } from "~/lib/motion";

/**
 * The navbar steps aside for the footer (DESIGN.md §13.9).
 *
 * Scrolling down into the footer hides the bar; any upward scroll while the
 * footer is still the screen brings it straight back, so a visitor does not
 * have to leave the panel to get navigation. Everywhere above the footer the
 * bar behaves exactly as it did.
 *
 * Driven by an observer on the footer plus scroll direction rather than by
 * scroll-position arithmetic: the album page's length varies with the number
 * of photographs, so there is no fixed offset to compare against.
 *
 * The result is written to `<html data-nav-hidden>` rather than passed down as
 * a prop. The navbar is rendered by the page and the footer by the layout
 * around it, so an attribute is the one place both can see; it also keeps the
 * whole behaviour off the home page, which never mounts this hook.
 */
export function useNavHide(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const footer = ref.current;
    if (!footer) return;

    const motion = readMotion();
    const threshold = motion["nav-hide-threshold"];
    const root = document.documentElement;

    // Present but false while the footer is off screen, so the CSS transition
    // is scoped to pages that have a footer at all.
    root.dataset.navHidden = "false";

    let onScreen = false;
    let lastY = window.scrollY;
    // Travel since the last direction change, so a few pixels of trackpad
    // jitter cannot flicker the bar.
    let travel = 0;
    // Which way the visitor was going when the footer arrived. A jump to the
    // bottom — the End key, a restored scroll position — is one enormous
    // scroll event that lands before the observer has said the footer is on
    // screen, so the direction has to be remembered rather than re-derived.
    let direction = 0;

    const set = (hidden: boolean) => {
      root.dataset.navHidden = hidden ? "true" : "false";
    };

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      if (delta === 0) return;
      direction = Math.sign(delta);
      if (!onScreen) return;

      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
      if (travel >= threshold) {
        set(true);
        travel = 0;
      } else if (travel <= -threshold) {
        set(false);
        travel = 0;
      }
    };

    // The bottom inset is what makes "in the footer" mean the panel is the
    // screen the visitor is on, rather than one pixel of it having appeared.
    // Expressed against the root rather than as a ratio of the target, because
    // on a short viewport the footer is taller than the screen and a ratio
    // would never reach its threshold.
    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries[entries.length - 1]!.isIntersecting;
        travel = 0;
        // Arriving by scrolling down is the footer being entered, which is the
        // trigger; leaving it upwards always restores the bar.
        if (!onScreen) set(false);
        else if (direction > 0) set(true);
      },
      { rootMargin: `0% 0% -${motion["nav-hide-inset"] * 100}% 0%` },
    );

    observer.observe(footer);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      delete root.dataset.navHidden;
    };
  }, [ref]);
}

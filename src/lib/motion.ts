/**
 * Motion values live in src/styles/tokens.css like every other design value.
 * GSAP needs numbers, so this reads them back off the document element once
 * and caches them. Nothing here re-types a timing — a missing token throws,
 * which is how token drift surfaces instead of silently animating at NaN.
 *
 * Client-only: every caller runs inside an effect.
 */

const MOTION_TOKENS = [
  "motion-instant",
  "motion-fast",
  "motion-base",
  "motion-sheet",
  "motion-slow",
  "motion-entrance",
  "motion-drift",
  "motion-drift-jitter",
  "stagger-chrome",
  "stagger-tile",
  "lerp-pointer",
  "lerp-pan",
  "depth-min",
  "depth-max",
  "depth-pan-factor",
  "drift-amplitude",
  "drift-amplitude-compact",
  "hover-tile-scale",
  "hover-link-opacity",
  "caption-rest-opacity",
  "reveal-threshold",
  "entrance-y",
  "entrance-scale",
  "hero-entrance-y",
  "chrome-reveal-y",
  "key-step",
  "key-page-ratio",
  "drag-threshold",
  "nav-hide-threshold",
  "nav-hide-inset",
  "cull-margin",
  "inertia-seconds",
  "inertia-max",
  "wheel-speed",
  "audio-volume",
  "audio-fade",
  "loader-appear",
  "loader-fade-in",
  "loader-rate",
  "loader-cycle",
  "loader-scramble-edge",
  "loader-floor",
  "loader-hold-min",
  "loader-ceiling",
  "loader-erase",
  "loader-blank",
  "loader-handoff",
  "loader-rest-opacity",
  "album-reveal-y",
  "album-reveal-dur",
  "album-reveal-stagger",
  "album-reveal-margin",
  "album-float-amp",
  "album-float-amp-compact",
  "album-float-period",
  "album-float-jitter",
  "album-hero-enter",
  "album-bar-delay",
] as const;

type MotionToken = (typeof MOTION_TOKENS)[number];
export type Motion = Record<MotionToken, number>;

let cache: Motion | null = null;

export function readMotion(): Motion {
  if (cache) return cache;

  const styles = getComputedStyle(document.documentElement);
  const values = {} as Motion;

  for (const token of MOTION_TOKENS) {
    const raw = styles.getPropertyValue(`--${token}`).trim();
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value)) {
      throw new Error(
        `Missing or non-numeric design token --${token}. Define it in src/styles/tokens.css.`,
      );
    }
    values[token] = value;
  }

  cache = values;
  return values;
}

/** Test seam — lets a re-render after a token change pick up new values. */
export function resetMotionCache() {
  cache = null;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Reads a length token (e.g. a breakpoint) back off the document element, so
 * media queries in TypeScript resolve from the same definition the CSS uses.
 */
export function readLengthToken(name: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim();
  if (!value) {
    throw new Error(
      `Missing design token --${name}. Define it in src/styles/tokens.css.`,
    );
  }
  return value;
}

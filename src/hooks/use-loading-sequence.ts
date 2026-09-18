import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { readMotion } from "~/lib/motion";
import { decodeDuration } from "~/lib/scramble";

const SESSION_KEY = "vows:loaded";

export type LoaderPhase =
  | "idle"
  | "decode"
  | "hold"
  | "erase"
  | "blank"
  | "handoff"
  | "done";

export type LoaderState = {
  phase: LoaderPhase;
  /** Seconds since the current phase began. Drives the pure text passes. */
  elapsed: number;
  /** Opacity of the three lines. */
  lineOpacity: number;
  /** Opacity of the white ground. */
  backdropOpacity: number;
};

type Motion = ReturnType<typeof readMotion>;

/**
 * The lines arrive together at a low opacity a beat after load, ramp to full
 * while still resolving, and fall away *with* the erase rather than after it.
 */
function lineOpacityFor(
  phase: LoaderPhase,
  elapsed: number,
  motion: Motion,
  reducedMotion: boolean,
) {
  switch (phase) {
    case "decode": {
      const since = elapsed - motion["loader-appear"];
      if (since <= 0) return 0;
      const ramp = Math.min(1, since / motion["loader-fade-in"]);
      if (reducedMotion) return ramp;
      const rest = motion["loader-rest-opacity"];
      return rest + (1 - rest) * ramp;
    }
    case "hold":
      return 1;
    case "erase":
      return Math.max(0, 1 - elapsed / motion["loader-erase"]);
    default:
      return 0;
  }
}

/**
 * Waits for the things that actually make the page look finished: the two
 * self-hosted faces, and the images marked eager (the first viewport of tiles).
 * Everything else is lazy and can arrive behind the loader.
 */
function assetsReady(): Promise<void> {
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const images = Array.from(
    document.querySelectorAll<HTMLImageElement>('img[loading="eager"]'),
  ).map((img) =>
    img.complete
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
  );
  return Promise.all([fonts, ...images]).then(() => undefined);
}

/**
 * Drives the loading screen (DESIGN.md §11).
 *
 * The 4.7s in the reference recording is a demo length, not a target: the hold
 * ends when the assets are actually ready, with a floor long enough for the
 * decode to finish and a ceiling so a slow network cannot strand anyone. A
 * visitor who has already seen it this session skips straight to the exit.
 */
function readSeen() {
  try {
    return (
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(SESSION_KEY) === "1"
    );
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Site data blocked; the loader simply plays again next time.
  }
}

export function useLoadingSequence(
  longestLine: string,
  reducedMotion: boolean,
) {
  // The server renders this: an opaque white ground with the lines at zero
  // opacity. Nothing here may touch the DOM — `readMotion` reads computed
  // styles, and calling it during render drops the whole route to client
  // rendering.
  const [state, setState] = useState<LoaderState>({
    phase: "idle",
    elapsed: 0,
    lineOpacity: 0,
    backdropOpacity: 1,
  });
  const phaseRef = useRef<LoaderPhase>("idle");

  useEffect(() => {
    // No "have I run before" guard here: React's StrictMode mounts, unmounts
    // and remounts effects in development, and a ref-based guard makes the
    // second — real — mount do nothing, leaving the sequence frozen on its
    // first frame. Re-running is instead made safe by resuming from whatever
    // phase is already in progress.
    const motion = readMotion();
    let phaseStart = performance.now();
    let ready = false;
    let cancelled = false;

    // Guarded: storage throws outright where site data is blocked, and this
    // runs on the home page — the loader missing its "already seen" mark is a
    // second animation, losing the page is not.
    const seen = readSeen();

    const publish = (phase: LoaderPhase, elapsed: number) =>
      setState({
        phase,
        elapsed,
        lineOpacity: lineOpacityFor(phase, elapsed, motion, reducedMotion),
        backdropOpacity:
          phase === "handoff"
            ? Math.max(0, 1 - elapsed / motion["loader-handoff"])
            : 1,
      });

    const setPhase = (next: LoaderPhase) => {
      phaseRef.current = next;
      phaseStart = performance.now();
      publish(next, 0);
    };

    if (phaseRef.current === "idle") {
      // Skipping to the exit: no decode, no hold — just the hand-off fade, so
      // a returning visitor gets the same continuous arrival without the wait.
      setPhase(seen ? "handoff" : "decode");
    } else {
      // A remount mid-sequence: pick up where it left off.
      setPhase(phaseRef.current);
    }

    void assetsReady().then(() => {
      ready = true;
    });
    const ceiling = window.setTimeout(
      () => {
        ready = true;
      },
      motion["loader-ceiling"] * 1000,
    );

    // The decode has to finish before the hold can end, however fast the
    // network was — the floor is the longer of the two.
    const decodeFor = reducedMotion
      ? motion["loader-fade-in"]
      : motion["loader-appear"] +
        decodeDuration(longestLine, motion["loader-rate"]);
    const floor = Math.max(motion["loader-floor"], decodeFor);

    const tick = () => {
      if (cancelled) return;
      const now = performance.now();
      const elapsed = (now - phaseStart) / 1000;
      const phase = phaseRef.current;

      switch (phase) {
        case "decode":
          if (elapsed >= decodeFor) setPhase("hold");
          else publish(phase, elapsed);
          break;
        case "hold":
          // `floor` is measured from the decode's start, so the hold only has
          // to cover whatever is left of it — but never less than
          // `loader-hold-min`, or a fast connection would start deleting the
          // line on the same frame its last character resolved.
          if (
            ready &&
            elapsed >=
              Math.max(motion["loader-hold-min"], floor - decodeFor)
          ) {
            setPhase("erase");
          } else {
            publish(phase, elapsed);
          }
          break;
        case "erase":
          if (elapsed >= motion["loader-erase"]) setPhase("blank");
          else publish(phase, elapsed);
          break;
        case "blank":
          if (elapsed >= motion["loader-blank"]) setPhase("handoff");
          else publish(phase, elapsed);
          break;
        case "handoff":
          if (elapsed >= motion["loader-handoff"]) {
            markSeen();
            setPhase("done");
          } else {
            publish(phase, elapsed);
          }
          break;
        default:
          break;
      }
    };

    gsap.ticker.add(tick);
    return () => {
      cancelled = true;
      gsap.ticker.remove(tick);
      window.clearTimeout(ceiling);
    };
  }, [longestLine, reducedMotion]);

  return state;
}

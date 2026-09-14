import { useEffect, useMemo, useRef, useState } from "react";

import { useReducedMotion } from "~/hooks/use-reduced-motion";
import {
  useLoadingSequence,
  type LoaderState,
} from "~/hooks/use-loading-sequence";
import { readMotion } from "~/lib/motion";
import { decodeAt, eraseAt } from "~/lib/scramble";
import { copy } from "~/data/copy";
import { cn } from "~/lib/utils";

/**
 * The loading screen (DESIGN.md §11).
 *
 * The centre line sits in exactly the structure `HeroTitle` uses — the same
 * centred column, the same gap, and a subheading placeholder holding the same
 * space — so when the loader clears, the hero's "Vows Weddings" is already at
 * the pixel the loader's was. That is the whole point of the screen.
 */
export function LoadingScreen() {
  const reducedMotion = useReducedMotion();

  const lines = useMemo(
    () => [copy.loader.practice, copy.loader.heading, copy.loader.place],
    [],
  );
  const longest = useMemo(
    () => lines.reduce((a, b) => (b.length > a.length ? b : a)),
    [lines],
  );

  const state = useLoadingSequence(longest, reducedMotion);
  if (state.phase === "done") return null;

  return (
    <div
      className="vows-loader fixed inset-0 z-[var(--z-loader)] bg-surface"
      style={{ opacity: state.backdropOpacity }}
      role="status"
      aria-label={copy.a11y.loader.region}
      aria-busy={state.phase !== "handoff"}
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative flex flex-col items-center gap-xs text-center whitespace-nowrap">
          <div
            className="vows-loader-line grid w-screen grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
              items-baseline px-[var(--loader-gutter)]"
            style={{ opacity: state.lineOpacity }}
          >
            <Label
              className="hidden justify-self-start xl:flex"
              text={copy.loader.practice}
              state={state}
              reducedMotion={reducedMotion}
              dot="practice"
              dotFirst
            />

            {/* Pinned to the middle column: below the desktop breakpoint the
                two flanking labels are display:none, which removes them from
                the grid entirely, and auto-placement would drop the heading
                into column 1 and take it off the viewport's centre. */}
            <h1 className="col-start-2 justify-self-center font-serif text-display text-ink">
              <Scrambled
                text={copy.loader.heading}
                state={state}
                reducedMotion={reducedMotion}
              />
            </h1>

            <Label
              className="hidden justify-self-end xl:flex"
              text={copy.loader.place}
              state={state}
              reducedMotion={reducedMotion}
              dot="place"
            />
          </div>

          {/* Reserves the hero subheading's space so the heading above lands on
              the hero's line rather than the viewport's centre. */}
          <p className="invisible font-sans text-subhead" aria-hidden>
            {copy.hero.subtitle}
          </p>

          {/* Below the desktop breakpoint the two labels cannot flank the
              heading without pushing it off the viewport's centre — and that
              centre is the whole point of the screen. They stack underneath
              instead, absolutely positioned so the block above keeps the hero's
              exact geometry. Only one of the two sets is ever displayed. */}
          <div
            className="absolute top-full left-1/2 mt-xl flex -translate-x-1/2 flex-col items-start
              gap-xs xl:hidden"
            style={{ opacity: state.lineOpacity }}
          >
            <Label
              text={copy.loader.practice}
              state={state}
              reducedMotion={reducedMotion}
              dot="practice"
              dotFirst
            />
            <Label
              text={copy.loader.place}
              state={state}
              reducedMotion={reducedMotion}
              dot="place"
              dotFirst
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({
  text,
  state,
  reducedMotion,
  dot,
  dotFirst = false,
  className,
}: {
  text: string;
  state: LoaderState;
  reducedMotion: boolean;
  dot: "practice" | "place";
  dotFirst?: boolean;
  className?: string;
}) {
  const mark = (
    <span
      className={cn(
        "vows-loader-dot size-[var(--loader-dot)] shrink-0 rounded-pill",
        dot === "practice" ? "bg-accent-practice" : "bg-accent-place",
      )}
      aria-hidden
    />
  );
  return (
    <span
      className={cn(
        "flex items-center gap-[var(--loader-gap)] font-sans text-meta text-ink",
        className,
      )}
    >
      {dotFirst && mark}
      <Scrambled text={text} state={state} reducedMotion={reducedMotion} />
      {!dotFirst && mark}
    </span>
  );
}

/**
 * One animating line. The finished string is in the accessibility tree from
 * the first frame and the scrambling characters are hidden from it, so a
 * screen reader never reads the symbol soup.
 */
function Scrambled({
  text,
  state,
  reducedMotion,
}: {
  text: string;
  state: LoaderState;
  reducedMotion: boolean;
}) {
  const [painted, setPainted] = useState(text);
  const motionRef = useRef<ReturnType<typeof readMotion> | null>(null);

  useEffect(() => {
    motionRef.current ??= readMotion();
    const motion = motionRef.current;

    if (reducedMotion) {
      setPainted(text);
      return;
    }

    const options = {
      rate: motion["loader-rate"],
      cycle: motion["loader-cycle"],
    };

    switch (state.phase) {
      case "idle":
        setPainted(decodeAt(text, 0, options));
        break;
      case "decode":
        setPainted(
          decodeAt(text, state.elapsed - motion["loader-appear"], options),
        );
        break;
      case "erase":
        setPainted(
          eraseAt(
            text,
            state.elapsed / motion["loader-erase"],
            options,
            motion["loader-scramble-edge"],
            state.elapsed,
          ),
        );
        break;
      case "blank":
      case "handoff":
        setPainted("");
        break;
      default:
        setPainted(text);
    }
  }, [text, state, reducedMotion]);

  return (
    <>
      <span className="sr-only-focusable">{text}</span>
      <span aria-hidden>{painted}</span>
    </>
  );
}

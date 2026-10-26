import type { ReactElement } from "react";

import { cn } from "../lib/cn";
import { focusRing } from "../lib/focus";
import type { PlayerProps } from "./player.types";

/* The 28 circle is the control. `before` gives a finger 44 to land on. Hover
 * fills the circle; nothing moves. */
const control = cn(
  "relative flex size-[28px] shrink-0 cursor-pointer items-center justify-center rounded-pill",
  "border border-hairline text-primary transition-colors motion-reduce:transition-none",
  "before:absolute before:-inset-space-2 hover:bg-surface",
  focusRing,
);

/* Figma draws the four playing bars at 8, 14, 6 and 11. Each rises and falls
 * from its own height, out of step with its neighbours. Reduced motion holds
 * them still at those heights, because they are the only sign the song is on. */
const bars = [
  { id: "a", playing: "h-space-2 [animation-delay:-150ms]" },
  { id: "b", playing: "h-[14px] [animation-delay:-600ms]" },
  { id: "c", playing: "h-[6px] [animation-delay:-300ms]" },
  { id: "d", playing: "h-[11px] [animation-delay:-750ms]" },
] as const;

function Glyph({ playing }: { playing: boolean }): ReactElement {
  return playing ? (
    <svg aria-hidden="true" className="fill-current" width="8" height="10" viewBox="0 0 8 10">
      <rect width="2.5" height="10" rx="1" />
      <rect x="5.5" width="2.5" height="10" rx="1" />
    </svg>
  ) : (
    <svg aria-hidden="true" className="fill-current" width="8" height="10" viewBox="0 0 8 10">
      <path d="M0 0L8 5L0 10Z" />
    </svg>
  );
}

/* One component, three sizes: the meter joins at the tablet width and the
 * track name at the desktop width. The button is never removed, because
 * stopping the music has to be possible everywhere. */
export function Player({ playing, onToggle, track, className }: PlayerProps): ReactElement {
  return (
    <div className={cn("flex items-center gap-[10px]", className)}>
      <button
        type="button"
        className={control}
        aria-label={playing ? "Pause the music" : "Play the music"}
        onClick={onToggle}
      >
        <Glyph playing={playing} />
      </button>
      <span
        aria-hidden="true"
        className={cn(
          "h-space-4 tablet:flex hidden w-[23px] items-center gap-[3px]",
          playing ? "text-primary" : "text-muted",
        )}
      >
        {bars.map((bar) => (
          <span
            key={bar.id}
            className={cn(
              "w-[2px] rounded-[1px] bg-current",
              playing ? cn(bar.playing, "animate-meter motion-reduce:animate-none") : "h-space-1",
            )}
          />
        ))}
      </span>
      <span
        aria-hidden="true"
        className="type-nav-legal text-secondary desktop:block hidden whitespace-nowrap"
      >
        {track}
      </span>
    </div>
  );
}

import type * as React from "react";

import { copy } from "~/data/copy";
import type { AmbienceStatus } from "~/hooks/use-ambience";
import type { Track } from "~/data/audio";

/**
 * The ambience widget (DESIGN.md §10). Not in Figma — built from the same
 * tokens and type styles as the bars so it reads as part of the set, and
 * placed clear of the navbar, the bottom bar, the mobile hamburger and the
 * floating CTA at all three breakpoints.
 *
 * It is chrome: it fades in with the bars on the first pan, so State 1 stays
 * exactly as Figma draws it.
 */
export function AmbiencePlayer({
  revealed,
  status,
  onToggle,
  track,
  audioRef,
}: {
  revealed: boolean;
  status: AmbienceStatus;
  onToggle: () => void;
  track: Track;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}) {
  const playing = status === "playing";
  const label = playing ? copy.a11y.player.pause : copy.a11y.player.play;

  return (
    <div
      data-chrome="bottom"
      data-revealed={revealed}
      {...(revealed ? {} : { inert: true })}
      className="vows-chrome vows-player fixed bottom-[var(--player-bottom)]
        left-[var(--player-inset)] z-[var(--z-chrome)] flex items-center gap-xs rounded-pill border
        border-border-subtle bg-surface py-[var(--cta-pad-y)] pr-md pb-md pl-xs"
      role="group"
      aria-label={copy.a11y.player.region}
    >
      {/* Preloaded on load, but never played until the visitor gestures. */}
      <audio ref={audioRef} preload="auto" loop>
        <source src={track.src} type={track.type} />
      </audio>

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={playing}
        aria-label={label}
        title={label}
        className="vows-player-toggle flex size-xl shrink-0 items-center justify-center rounded-pill
          text-ink transition-opacity duration-[var(--duration-fast)] ease-hover
          hover:opacity-[var(--hover-link-opacity)]"
      >
        <span
          className="vows-player-glyph"
          data-playing={playing}
          aria-hidden
        />
      </button>

      <span className="vows-player-eq" data-playing={playing} aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </span>

      <span
        className="font-sans text-caption font-medium text-caption-ink"
        title={copy.a11y.player.nowPlaying(track.title, track.artist)}
      >
        {track.title}
      </span>

      <span aria-live="polite" className="sr-only-focusable">
        {status === "playing"
          ? copy.a11y.player.playing
          : status === "blocked"
            ? copy.a11y.player.blocked
            : copy.a11y.player.paused}
      </span>
    </div>
  );
}

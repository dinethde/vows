import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { readMotion } from "~/lib/motion";
import { track } from "~/data/audio";

const STORAGE_KEY = "vows:ambience";

export type AmbienceStatus = "paused" | "playing" | "blocked";

/**
 * Background ambience (DESIGN.md §10).
 *
 * Browsers reject audible playback that is not tied to a user gesture, so
 * nothing is attempted on load: the element preloads, the widget renders
 * paused, and `start()` runs on the visitor's first pan. A rejected `play()`
 * leaves the widget paused rather than claiming to play, and the visitor's own
 * choice is remembered — if they pause it, it stays paused next visit.
 */
/** Storage, guarded — see the note in gallery-canvas.tsx. A forgotten
 * preference is a shrug; a thrown `SecurityError` inside a click handler
 * leaves the player wedged. */
function remember(state: "playing" | "paused") {
  try {
    window.localStorage.setItem(STORAGE_KEY, state);
  } catch {
    // Nothing to do: the preference lasts the session instead.
  }
}

function wasPaused() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "paused";
  } catch {
    return false;
  }
}

export function useAmbience() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRef = useRef<gsap.core.Tween | null>(null);
  const [status, setStatus] = useState<AmbienceStatus>("paused");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0;
    const onError = () => setStatus("blocked");
    audio.addEventListener("error", onError);
    return () => {
      fadeRef.current?.kill();
      audio.removeEventListener("error", onError);
      audio.pause();
    };
  }, []);

  const fadeTo = useCallback((volume: number, onDone?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;
    fadeRef.current?.kill();
    fadeRef.current = gsap.to(audio, {
      volume,
      duration: readMotion()["audio-fade"],
      ease: "none",
      onComplete: onDone,
    });
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setStatus("playing");
      fadeTo(readMotion()["audio-volume"]);
      remember("playing");
    } catch {
      // Autoplay policy, a missing codec, or a blocked request. Show the
      // truth — paused — rather than a playing widget with no sound.
      setStatus("blocked");
    }
  }, [fadeTo]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setStatus("paused");
    remember("paused");
    fadeTo(0, () => audio.pause());
  }, [fadeTo]);

  const toggle = useCallback(() => {
    if (status === "playing") pause();
    else void play();
  }, [status, play, pause]);

  /**
   * Called from the first pan. Honours a remembered pause, and never fights a
   * visitor who has already used the control this session.
   */
  const start = useCallback(() => {
    if (status !== "paused") return;
    if (wasPaused()) return;
    void play();
  }, [status, play]);

  return { audioRef, status, toggle, start, track };
}

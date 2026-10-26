"use client";

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactElement, ReactNode } from "react";

import { music } from "@/config/site";

import { readChoice, serverChoice, subscribe, writeChoice } from "./music-store";
import type { MusicChoice } from "./music-store";

export interface MusicContextValue {
  playing: boolean;
  /** What the visitor chose on the first-load prompt, or null if not asked yet. */
  choice: MusicChoice;
  toggle: () => void;
  /** The first-load prompt: start the song, or carry on without it. */
  choose: (choice: "on" | "off") => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function useMusic(): MusicContextValue {
  const value = use(MusicContext);
  if (!value) throw new Error("useMusic needs a MusicProvider above it.");
  return value;
}

export interface MusicProviderProps {
  children: ReactNode;
}

/**
 * Owns the one audio element. It sits in the site layout, above every page, so
 * moving between pages never restarts the song. Nothing is downloaded until a
 * click or a tap asks for it, and a browser will not play before one anyway.
 */
export function MusicProvider({ children }: MusicProviderProps): ReactElement {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const choice = useSyncExternalStore(subscribe, readChoice, serverChoice);

  const play = useCallback(() => {
    // A refusal — a muted tab, a missing file — leaves the player on Paused.
    void audio.current?.play().catch(() => {
      setPlaying(false);
    });
  }, []);

  const toggle = useCallback(() => {
    if (playing) {
      audio.current?.pause();
      writeChoice("off");
    } else {
      play();
      writeChoice("on");
    }
  }, [playing, play]);

  const choose = useCallback(
    (next: "on" | "off") => {
      writeChoice(next);
      if (next === "on") play();
    },
    [play],
  );

  const value = useMemo(
    () => ({ playing, choice, toggle, choose }),
    [playing, choice, toggle, choose],
  );

  return (
    <MusicContext value={value}>
      <audio
        ref={audio}
        preload="none"
        loop
        onPlay={() => {
          setPlaying(true);
        }}
        onPause={() => {
          setPlaying(false);
        }}
      >
        <source src={music.m4a} type="audio/mp4" />
        <source src={music.mp3} type="audio/mpeg" />
      </audio>
      {children}
    </MusicContext>
  );
}

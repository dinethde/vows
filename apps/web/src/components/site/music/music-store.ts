/**
 * The visitor's choice about the music, kept for the visit and no longer.
 * sessionStorage can be missing or blocked, so every read has a default.
 */
export type MusicChoice = "on" | "off" | null;

const KEY = "vows:music";
const listeners = new Set<() => void>();

export function readChoice(): MusicChoice {
  try {
    const value = window.sessionStorage.getItem(KEY);
    return value === "on" || value === "off" ? value : null;
  } catch {
    return null;
  }
}

export function writeChoice(choice: "on" | "off"): void {
  try {
    window.sessionStorage.setItem(KEY, choice);
  } catch {
    // Private mode. The choice simply lasts until the next page load.
  }
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** On the server, and on the first client render, nobody has chosen yet. */
export const serverChoice = (): MusicChoice => null;

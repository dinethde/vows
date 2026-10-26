/**
 * Whether the two bars on the home page have been brought in yet. They arrive
 * on the first scroll, drag or key press, and then stay for the visit.
 */
const KEY = "vows:bars";
const listeners = new Set<() => void>();

export function barsShown(): boolean {
  try {
    return window.sessionStorage.getItem(KEY) === "shown";
  } catch {
    return false;
  }
}

export function showBars(): void {
  if (barsShown()) return;
  try {
    window.sessionStorage.setItem(KEY, "shown");
  } catch {
    // Private mode: they simply come in again on the next page load.
  }
  for (const listener of listeners) listener();
}

export function subscribeToBars(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** On the server, and on the first paint, the bars are still held back. */
export const barsShownOnServer = (): boolean => false;

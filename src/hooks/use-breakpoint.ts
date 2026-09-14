import { useSyncExternalStore } from "react";

import { readLengthToken } from "~/lib/motion";
import type { Breakpoint } from "~/data/tiles";

/**
 * DESIGN.md §3.1. Widths come from --breakpoint-md / --breakpoint-xl so that
 * TypeScript and Tailwind agree by construction. The server always renders
 * `desktop`; the client corrects on hydration, before anything is visible.
 */
const TIERS: Array<[Breakpoint, string]> = [
  ["desktop", "breakpoint-xl"],
  ["tablet", "breakpoint-md"],
];

let lists: Array<[Breakpoint, MediaQueryList]> | null = null;

function mediaLists() {
  if (!lists) {
    lists = TIERS.map(([name, token]) => [
      name,
      window.matchMedia(`(min-width: ${readLengthToken(token)})`),
    ]);
  }
  return lists;
}

function read(): Breakpoint {
  for (const [name, list] of mediaLists()) {
    if (list.matches) return name;
  }
  return "mobile";
}

function subscribe(onChange: () => void) {
  const current = mediaLists();
  for (const [, list] of current) list.addEventListener("change", onChange);
  return () => {
    for (const [, list] of current)
      list.removeEventListener("change", onChange);
  };
}

export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, read, () => "desktop" as const);
}

import { copy } from "~/data/copy";

/** Jumps past the canvas to the navigation (DESIGN.md §6). */
export function SkipLink() {
  return (
    <a className="sr-only-focusable font-serif text-body" href="#vows-nav">
      {copy.a11y.skipToNav}
    </a>
  );
}

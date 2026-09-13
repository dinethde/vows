import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge has to be told about the project's type scale. Our font sizes
 * are named (`text-meta`, `text-display`, …) and so are our text colours
 * (`text-ink`, `text-caption-ink`, …); without this, a `text-*` size and a
 * `text-*` colour on the same element look like a conflict and one is silently
 * dropped. Everything not listed here keeps falling into the colour group.
 *
 * The names must match the `--text-*` tokens in src/styles/tokens.css.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "h5",
            "body",
            "cta",
            "bar",
            "bar-sm",
            "subhead",
            "caption",
            "meta",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/* The `type-*` utilities come from @vows/tokens, so tailwind-merge has never
 * heard of them. Without this group `type-body-s type-body-m` keeps both and
 * the stylesheet order decides, not the caller. */
const merge = extendTailwindMerge<"vows-type">({
  extend: {
    classGroups: {
      "vows-type": [{ type: [(value: string) => value.length > 0] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return merge(clsx(inputs));
}

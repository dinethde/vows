/**
 * The album gallery's arrangement sequence (DESIGN.md §12.4).
 *
 * Real albums vary in length, so the Figma frame's placement is expressed as a
 * repeating sequence of arrangements rather than as fixed positions. The
 * sequence is walked, each arrangement takes as many photographs as it holds at
 * the current breakpoint, and the walk cycles until the album runs out.
 *
 * Desktop geometry is transcribed from Figma exactly. Tablet and mobile have no
 * Figma frames — their rules are derived here and recorded in DESIGN.md §12.5.
 */

export type Breakpoint = "mobile" | "tablet" | "desktop";

export type SizeFamily =
  | "portraitLg"
  | "portraitMd"
  | "accentSm"
  | "accentMd"
  | "tallLg"
  | "squareLg"
  | "fullBleed";

export type Size = { w: number; h: number };

/**
 * Density drops rather than everything shrinking: tablet runs at ~0.81 of
 * desktop and mobile at ~0.63, which keeps every photograph large enough to
 * read instead of turning the desktop set into thumbnails.
 */
export const familySizes: Record<Breakpoint, Record<SizeFamily, Size>> = {
  desktop: {
    portraitLg: { w: 410, h: 600 },
    portraitMd: { w: 325, h: 500 },
    accentSm: { w: 230, h: 230 },
    accentMd: { w: 250, h: 380 },
    tallLg: { w: 475, h: 750 },
    squareLg: { w: 750, h: 750 },
    fullBleed: { w: 1440, h: 1135 },
  },
  tablet: {
    portraitLg: { w: 330, h: 483 },
    portraitMd: { w: 262, h: 403 },
    accentSm: { w: 186, h: 186 },
    accentMd: { w: 202, h: 307 },
    tallLg: { w: 384, h: 606 },
    squareLg: { w: 500, h: 500 },
    fullBleed: { w: 834, h: 657 },
  },
  mobile: {
    portraitLg: { w: 260, h: 380 },
    portraitMd: { w: 210, h: 323 },
    accentSm: { w: 140, h: 140 },
    accentMd: { w: 150, h: 228 },
    tallLg: { w: 290, h: 458 },
    squareLg: { w: 300, h: 300 },
    fullBleed: { w: 390, h: 307 },
  },
};

/** Which pool bucket each family is cropped from. */
export const familyBucket: Record<SizeFamily, "portrait" | "square" | "wide"> = {
  portraitLg: "portrait",
  portraitMd: "portrait",
  accentSm: "square",
  accentMd: "portrait",
  tallLg: "portrait",
  squareLg: "square",
  fullBleed: "wide",
};

/**
 * How a compact arrangement sits across the column.
 *   row   — n of one family, centred as a group
 *   place — each photograph against a gutter, with its own inset and offset,
 *           which is what keeps the uneven, off-grid character
 *   full  — edge to edge
 */
export type CompactSpec =
  | { mode: "row"; family: SizeFamily; count: number }
  | {
    mode: "place";
    slots: Array<{
      family: SizeFamily;
      align: "left" | "right";
      inset: number;
      dy: number;
    }>;
  }
  | { mode: "full"; family: SizeFamily };

export type ArrangementSpec = {
  kind: string;
  /** Desktop: exact Figma placement. `x` is within the 1440 column. */
  desktop: {
    /** Distance from the previous arrangement's bottom. */
    gap: number;
    height: number;
    slots: Array<{ family: SizeFamily; x: number; dy: number }>;
  };
  /**
   * Tablet and mobile hold fewer photographs per arrangement — a triple becomes
   * a pair at 834 and a single at 390 — so the sequence degrades into more,
   * simpler arrangements rather than compressing into narrower ones.
   */
  compact: { tablet: CompactSpec; mobile: CompactSpec };
};

/** How many photographs a compact arrangement consumes. */
function compactCapacity(spec: CompactSpec) {
  if (spec.mode === "row") return spec.count;
  if (spec.mode === "place") return spec.slots.length;
  return 1;
}

/**
 * The sequence, in Figma's order: pair, small accent, single right, triple row,
 * single left large, offset duo, small accent, single right, single left, pair,
 * full-bleed, closing pair.
 */
export const sequence: ArrangementSpec[] = [
  {
    kind: "pair",
    desktop: {
      gap: 479,
      height: 600,
      slots: [
        { family: "portraitLg", x: 300, dy: 0 },
        { family: "portraitLg", x: 730, dy: 0 },
      ],
    },
    compact: {
      tablet: { mode: "row", family: "portraitLg", count: 2 },
      mobile: {
        mode: "place",
        slots: [{ family: "portraitLg", align: "left", inset: 0, dy: 0 }],
      },
    },
  },
  {
    kind: "accentRight",
    desktop: {
      gap: 486,
      height: 230,
      slots: [{ family: "accentSm", x: 1134, dy: 0 }],
    },
    compact: {
      tablet: {
        mode: "place",
        slots: [{ family: "accentSm", align: "right", inset: 46, dy: 0 }],
      },
      mobile: {
        mode: "place",
        slots: [{ family: "accentSm", align: "right", inset: 24, dy: 0 }],
      },
    },
  },
  {
    kind: "singleRight",
    desktop: {
      gap: 600,
      height: 600,
      slots: [{ family: "portraitLg", x: 925, dy: 0 }],
    },
    compact: {
      tablet: {
        mode: "place",
        slots: [{ family: "portraitLg", align: "right", inset: 0, dy: 0 }],
      },
      mobile: {
        mode: "place",
        slots: [{ family: "portraitLg", align: "right", inset: 0, dy: 0 }],
      },
    },
  },
  {
    kind: "triple",
    desktop: {
      gap: 320,
      height: 500,
      slots: [
        { family: "portraitMd", x: 212, dy: 0 },
        { family: "portraitMd", x: 557, dy: 0 },
        { family: "portraitMd", x: 902, dy: 0 },
      ],
    },
    compact: {
      tablet: { mode: "row", family: "portraitMd", count: 2 },
      mobile: {
        mode: "place",
        slots: [{ family: "portraitMd", align: "left", inset: 28, dy: 0 }],
      },
    },
  },
  {
    kind: "singleLeftLarge",
    desktop: {
      gap: 220,
      height: 750,
      slots: [{ family: "tallLg", x: 106, dy: 0 }],
    },
    compact: {
      tablet: {
        mode: "place",
        slots: [{ family: "tallLg", align: "left", inset: 0, dy: 0 }],
      },
      mobile: {
        mode: "place",
        slots: [{ family: "tallLg", align: "left", inset: 0, dy: 0 }],
      },
    },
  },
  {
    kind: "offsetDuo",
    desktop: {
      gap: 272,
      height: 827,
      slots: [
        { family: "accentMd", x: 40, dy: 0 },
        { family: "squareLg", x: 648, dy: 77 },
      ],
    },
    compact: {
      // Keeps the desktop character — a small frame at one gutter, a large one
      // dropped below it at the other — rather than becoming a plain row.
      tablet: {
        mode: "place",
        slots: [
          { family: "accentMd", align: "left", inset: 0, dy: 0 },
          { family: "squareLg", align: "right", inset: 0, dy: 62 },
        ],
      },
      mobile: {
        mode: "place",
        slots: [{ family: "squareLg", align: "right", inset: 0, dy: 0 }],
      },
    },
  },
  {
    kind: "accentLeft",
    desktop: {
      gap: 352,
      height: 230,
      slots: [{ family: "accentSm", x: 215, dy: 0 }],
    },
    compact: {
      tablet: {
        mode: "place",
        slots: [{ family: "accentSm", align: "left", inset: 62, dy: 0 }],
      },
      mobile: {
        mode: "place",
        slots: [{ family: "accentSm", align: "left", inset: 36, dy: 0 }],
      },
    },
  },
  {
    kind: "singleRightMd",
    desktop: {
      gap: 350,
      height: 500,
      slots: [{ family: "portraitMd", x: 985, dy: 0 }],
    },
    compact: {
      tablet: {
        mode: "place",
        slots: [{ family: "portraitMd", align: "right", inset: 30, dy: 0 }],
      },
      mobile: {
        mode: "place",
        slots: [{ family: "portraitMd", align: "right", inset: 18, dy: 0 }],
      },
    },
  },
  {
    kind: "singleLeftMd",
    desktop: {
      gap: 158,
      height: 500,
      slots: [{ family: "portraitMd", x: 192, dy: 0 }],
    },
    compact: {
      tablet: {
        mode: "place",
        slots: [{ family: "portraitMd", align: "left", inset: 24, dy: 0 }],
      },
      mobile: {
        mode: "place",
        slots: [{ family: "portraitMd", align: "left", inset: 12, dy: 0 }],
      },
    },
  },
  {
    kind: "pairMd",
    desktop: {
      gap: 255,
      height: 500,
      slots: [
        { family: "portraitMd", x: 660, dy: 0 },
        { family: "portraitMd", x: 1005, dy: 0 },
      ],
    },
    compact: {
      tablet: { mode: "row", family: "portraitMd", count: 2 },
      mobile: {
        mode: "place",
        slots: [{ family: "portraitMd", align: "right", inset: 0, dy: 0 }],
      },
    },
  },
  {
    kind: "fullBleed",
    desktop: {
      gap: 698,
      height: 1135,
      slots: [{ family: "fullBleed", x: 0, dy: 0 }],
    },
    compact: {
      tablet: { mode: "full", family: "fullBleed" },
      mobile: { mode: "full", family: "fullBleed" },
    },
  },
  {
    kind: "pairEnd",
    desktop: {
      gap: 1119,
      height: 600,
      slots: [
        { family: "portraitLg", x: 191, dy: 0 },
        { family: "portraitLg", x: 621, dy: 0 },
      ],
    },
    compact: {
      tablet: { mode: "row", family: "portraitLg", count: 2 },
      mobile: {
        mode: "place",
        slots: [{ family: "portraitLg", align: "left", inset: 20, dy: 0 }],
      },
    },
  },
];

/** The 1440 column the desktop geometry is transcribed against. */
export const DESIGN_WIDTH = 1440;

/** Gutters, row gaps, and how desktop's vertical rhythm is compressed. */
export const compactRules = {
  tablet: { gutter: 24, rowGap: 20, gapRatio: 0.62, gapMin: 48, gapMax: 520 },
  mobile: { gutter: 16, rowGap: 12, gapRatio: 0.34, gapMin: 32, gapMax: 280 },
} as const;

export type PlacedSlot = {
  /** Index into the album's photograph list. */
  photoIndex: number;
  family: SizeFamily;
  x: number;
  y: number;
  w: number;
  h: number;
  /** True when the slot should break out of the column to the viewport edge. */
  fullBleed: boolean;
};

export type GalleryLayout = {
  /** Column width the slots are positioned against. */
  width: number;
  height: number;
  slots: PlacedSlot[];
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Walks the sequence, feeding it photographs until they run out.
 *
 * An arrangement is skipped when it holds more photographs than are left, so a
 * short album never renders a half-empty triple — the walk simply falls through
 * to the next arrangement that fits.
 */
export function layoutGallery(
  photoCount: number,
  breakpoint: Breakpoint,
  viewportWidth: number,
): GalleryLayout {
  const sizes = familySizes[breakpoint];
  const isDesktop = breakpoint === "desktop";
  const rules = isDesktop ? null : compactRules[breakpoint];
  const width = isDesktop ? DESIGN_WIDTH : viewportWidth;

  const slots: PlacedSlot[] = [];
  let photoIndex = 0;
  let y = 0;
  let step = 0;
  /** Guards against a sequence that can never consume the remaining photos. */
  let barren = 0;

  while (photoIndex < photoCount && barren < sequence.length) {
    const spec = sequence[step % sequence.length]!;
    step += 1;

    const remaining = photoCount - photoIndex;
    const capacity = isDesktop
      ? spec.desktop.slots.length
      : compactCapacity(spec.compact[breakpoint]);

    if (capacity > remaining) {
      barren += 1;
      continue;
    }
    barren = 0;

    if (isDesktop) {
      y += spec.desktop.gap;
      let height = spec.desktop.height;

      for (const slot of spec.desktop.slots) {
        const size = sizes[slot.family];
        const isFullBleed = slot.family === "fullBleed";

        // Past the design width the column stops growing, so the full-bleed
        // image breaks out of it to keep the reset it is there for. Below the
        // design width the whole column is scaled instead (§12.5), and this
        // slot is already exactly the column's width.
        const overflow = isFullBleed && viewportWidth > DESIGN_WIDTH;
        const w = overflow ? viewportWidth : size.w;
        const h = overflow ? Math.round((w * size.h) / size.w) : size.h;
        if (overflow) height = Math.max(height, h);

        slots.push({
          photoIndex: photoIndex++,
          family: slot.family,
          x: overflow ? Math.round((DESIGN_WIDTH - w) / 2) : slot.x,
          y: y + slot.dy,
          w,
          h,
          fullBleed: isFullBleed,
        });
      }
      y += height;
      continue;
    }

    const compact = spec.compact[breakpoint];
    y += Math.round(
      clamp(spec.desktop.gap * rules!.gapRatio, rules!.gapMin, rules!.gapMax),
    );

    let height = 0;

    if (compact.mode === "full") {
      const size = sizes[compact.family];
      height = Math.round((width * size.h) / size.w);
      slots.push({
        photoIndex: photoIndex++,
        family: compact.family,
        x: 0,
        y,
        w: width,
        h: height,
        fullBleed: true,
      });
    } else if (compact.mode === "row") {
      const size = sizes[compact.family];
      const rowWidth =
        compact.count * size.w + (compact.count - 1) * rules!.rowGap;
      const left = Math.round((width - rowWidth) / 2);
      for (let i = 0; i < compact.count; i += 1) {
        slots.push({
          photoIndex: photoIndex++,
          family: compact.family,
          x: left + i * (size.w + rules!.rowGap),
          y,
          w: size.w,
          h: size.h,
          fullBleed: false,
        });
      }
      height = size.h;
    } else {
      for (const slot of compact.slots) {
        const size = sizes[slot.family];
        const x =
          slot.align === "left"
            ? rules!.gutter + slot.inset
            : width - rules!.gutter - slot.inset - size.w;
        slots.push({
          photoIndex: photoIndex++,
          family: slot.family,
          x,
          y: y + slot.dy,
          w: size.w,
          h: size.h,
          fullBleed: false,
        });
        height = Math.max(height, slot.dy + size.h);
      }
    }

    y += height;
  }

  return { width, height: y, slots };
}

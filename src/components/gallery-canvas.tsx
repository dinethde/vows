import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

import { PhotoTile } from "~/components/photo-tile";
import { useBreakpoint } from "~/hooks/use-breakpoint";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { readMotion } from "~/lib/motion";
import { advancePan, attachPanInput, cellOffset, createPan } from "~/lib/pan";
import type { PanState } from "~/lib/pan";
import { copy } from "~/data/copy";
import { bands, type BandSpec, type Tile } from "~/data/tiles";

type GalleryCanvasProps = {
  /** Fires once, on the visitor's first pan in any direction (DESIGN.md §4). */
  onFirstPan: () => void;
};

/** Test seam: the canvas element carries a live handle on its pan offset. */
export type PanDebugElement = HTMLElement & { __vowsPan?: PanState };

type Lattice = {
  rows: number;
  cols: number;
  /** Viewport x the base cell's band origin sits at when the pan is zero. */
  originX: number;
};

/**
 * How many lattice cells cover the viewport on each axis (DESIGN.md §3.2).
 * One more than strictly needed per axis, so a cell only ever recycles while
 * it is completely off screen.
 */
function computeLattice(band: BandSpec, vw: number, vh: number): Lattice {
  const originX = (vw - band.designWidth) / 2;
  return {
    rows: Math.ceil((vh - band.minY) / band.height) + 1,
    cols: Math.ceil((vw - band.minX - originX) / band.width) + 1,
    originX,
  };
}

/** Smaller tiles drift further — DESIGN.md §5.2 #4. */
function buildDepths(band: BandSpec, min: number, max: number) {
  const areas = band.tiles.map((tile) => tile.w * tile.h);
  const smallest = Math.min(...areas);
  const largest = Math.max(...areas);
  return new Map(
    band.tiles.map((tile: Tile) => {
      const span = largest - smallest;
      const t = span === 0 ? 0 : (tile.w * tile.h - smallest) / span;
      return [tile.index, max - t * (max - min)];
    }),
  );
}

export function GalleryCanvas({ onFirstPan }: GalleryCanvasProps) {
  const breakpoint = useBreakpoint();
  const reducedMotion = useReducedMotion();
  const band = bands[breakpoint];

  const viewportRef = useRef<HTMLDivElement>(null);
  const pan = useRef(createPan());
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const hasPanned = useRef(false);

  const [lattice, setLattice] = useState<Lattice>(() => ({
    rows: 2,
    cols: 2,
    originX: 0,
  }));

  // Held in a ref, not a dependency: a gesture must never be interrupted by
  // the callback's identity changing. Tearing the effect down mid-drag drops
  // the pointer capture and strands the pan.
  const onFirstPanRef = useRef(onFirstPan);
  onFirstPanRef.current = onFirstPan;

  const notifyPan = useCallback(() => {
    if (hasPanned.current) return;
    hasPanned.current = true;
    onFirstPanRef.current();
  }, []);

  // ---- lattice sizing ---------------------------------------------------
  useEffect(() => {
    const measure = () =>
      setLattice(computeLattice(band, window.innerWidth, window.innerHeight));
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [band]);

  // ---- entrance (DESIGN.md §5.2 #1) -------------------------------------
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const motion = readMotion();
    const tileById = new Map(band.tiles.map((tile) => [tile.index, tile]));
    const spanX = lattice.cols * band.width;
    const spanY = lattice.rows * band.height;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const frames: HTMLElement[] = [];
    const ranks: number[] = [];

    // Only cells on screen at load are worth animating in. GSAP reads each
    // target's computed style the first time it touches it, and that read is
    // the entrance's whole cost — so the off-screen repeats are skipped.
    for (const cell of viewport.querySelectorAll<HTMLElement>("[data-cell]")) {
      const row = Number(cell.dataset.cellRow);
      const col = Number(cell.dataset.cellCol);
      const cx = lattice.originX + cellOffset(col, 0, band.width, spanX);
      const cy = cellOffset(row, 0, band.height, spanY);
      const left = cx + band.minX;
      const top = cy + band.minY;
      if (left > vw || left + band.width < 0) continue;
      if (top > vh || top + band.height < 0) continue;

      for (const node of cell.querySelectorAll<HTMLElement>(".vows-tile")) {
        const frame = node.querySelector<HTMLElement>(".vows-tile-frame");
        const spec = tileById.get(Number(node.dataset.tile));
        if (!frame || !spec) continue;
        frames.push(frame);
        ranks.push(
          Math.hypot(
            cx + spec.x + spec.w / 2 - vw / 2,
            cy + spec.y + spec.h / 2 - vh / 2,
          ),
        );
      }
    }
    if (!frames.length) return;

    // Stagger order comes from the tile table, never from a measurement.
    const furthest = Math.max(...ranks, 1);
    const longest = motion["stagger-tile"] * band.tiles.length;
    const delays = ranks.map((rank) => (rank / furthest) * longest);

    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.fromTo(
          frames,
          { opacity: 0 },
          { opacity: 1, duration: motion["motion-base"], ease: "none" },
        );
        return;
      }
      gsap.fromTo(
        frames,
        { opacity: 0, y: motion["entrance-y"], scale: motion["entrance-scale"] },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: motion["motion-entrance"],
          ease: "power4.out",
          stagger: (index) => delays[index] ?? 0,
        },
      );
    }, viewport);

    return () => context.revert();
  }, [band, breakpoint, reducedMotion, lattice]);

  // ---- pan, parallax and drift ------------------------------------------
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const motion = readMotion();
    const depths = buildDepths(band, motion["depth-min"], motion["depth-max"]);
    const tileById = new Map(band.tiles.map((tile) => [tile.index, tile]));
    const spanX = lattice.cols * band.width;
    const spanY = lattice.rows * band.height;
    const amplitude =
      breakpoint === "mobile"
        ? motion["drift-amplitude-compact"]
        : motion["drift-amplitude"];
    const lerp = reducedMotion ? 1 : motion["lerp-pan"];
    const cull = motion["cull-margin"];

    // GSAP has no `translate` shorthand, so x and y get a setter each.
    const cells = Array.from(
      viewport.querySelectorAll<HTMLElement>("[data-cell]"),
    ).map((el) => ({
      setX: gsap.quickSetter(el, "x", "px") as (value: number) => void,
      setY: gsap.quickSetter(el, "y", "px") as (value: number) => void,
      row: Number(el.dataset.cellRow),
      col: Number(el.dataset.cellCol),
      tiles: Array.from(el.querySelectorAll<HTMLElement>(".vows-tile")).map(
        (node) => ({
          setX: gsap.quickSetter(node, "x", "px") as (value: number) => void,
          setY: gsap.quickSetter(node, "y", "px") as (value: number) => void,
          spec: tileById.get(Number(node.dataset.tile)),
        }),
      ),
    }));

    // A live handle on the pan offset, for tests and for the browser pass.
    // One assignment at setup; nothing is written per frame.
    (viewport as PanDebugElement).__vowsPan = pan.current;

    // ---- input ---------------------------------------------------------
    const detachInput = attachPanInput({
      target: viewport,
      pan: pan.current,
      wheelSpeed: motion["wheel-speed"],
      dragThreshold: motion["drag-threshold"],
      inertiaSeconds: motion["inertia-seconds"],
      inertiaMax: motion["inertia-max"],
      revealThreshold: motion["reveal-threshold"],
      reducedMotion,
      onIntent: notifyPan,
      onDragChange: (dragging) => {
        if (dragging) viewport.setAttribute("data-panning", "true");
        else viewport.removeAttribute("data-panning");
      },
    });

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.current.tx = event.clientX - window.innerWidth / 2;
      pointer.current.ty = event.clientY - window.innerHeight / 2;
    };
    const onPointerLeave = () => {
      pointer.current.tx = 0;
      pointer.current.ty = 0;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      // The mobile menu owns the keyboard while it is open.
      if (document.querySelector("[data-menu-panel]")) return;

      const node = event.target;
      const target = node instanceof HTMLElement ? node : null;

      // Tabbing is intent too: without this the chrome would stay hidden for
      // a keyboard-only visitor, and the skip link would lead into an inert
      // navbar (DESIGN.md §4).
      if (event.key === "Tab") {
        notifyPan();
        return;
      }

      const page = window.innerHeight * motion["key-page-ratio"];
      const step = motion["key-step"];
      let dx = 0;
      let dy = 0;

      switch (event.key) {
        case "ArrowDown":
          dy = step;
          break;
        case "ArrowUp":
          dy = -step;
          break;
        case "ArrowRight":
          dx = step;
          break;
        case "ArrowLeft":
          dx = -step;
          break;
        case "PageDown":
          dy = page;
          break;
        case "PageUp":
          dy = -page;
          break;
        case " ":
          if (
            target &&
            /^(BUTTON|A|INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
          )
            return;
          dy = event.shiftKey ? -page : page;
          break;
        case "Home":
          pan.current.targetX = 0;
          pan.current.targetY = 0;
          notifyPan();
          event.preventDefault();
          return;
        default:
          return;
      }

      pan.current.targetX += dx;
      pan.current.targetY += dy;
      notifyPan();
      event.preventDefault();
    };

    // Tabbing to a photograph pulls it into view, on both axes (DESIGN.md §6).
    const onFocusIn = (event: FocusEvent) => {
      const tile = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        ".vows-tile",
      );
      if (!tile) return;
      const rect = tile.getBoundingClientRect();
      const marginY = window.innerHeight * 0.15;
      const marginX = window.innerWidth * 0.15;
      if (rect.top < marginY) {
        pan.current.targetY -= marginY - rect.top;
      } else if (rect.bottom > window.innerHeight - marginY) {
        pan.current.targetY += rect.bottom - (window.innerHeight - marginY);
      }
      if (rect.left < marginX) {
        pan.current.targetX -= marginX - rect.left;
      } else if (rect.right > window.innerWidth - marginX) {
        pan.current.targetX += rect.right - (window.innerWidth - marginX);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("keydown", onKeyDown);
    viewport.addEventListener("focusin", onFocusIn);

    // ---- frame ----------------------------------------------------------
    const start = performance.now();

    // Hydration assumes motion is allowed, so a tick or two of drift can land
    // before the media query corrects. Clear it, or tiles sit a few px off.
    if (reducedMotion) {
      for (const cell of cells) {
        for (const tile of cell.tiles) {
          tile.setX(0);
          tile.setY(0);
        }
      }
    }

    const tick = () => {
      advancePan(pan.current, lerp);
      const { x: panX, y: panY } = pan.current;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const halfVw = vw / 2;
      const halfVh = vh / 2;

      let elapsed = 0;
      let px = 0;
      let py = 0;

      if (!reducedMotion) {
        const p = pointer.current;
        p.x += (p.tx - p.x) * motion["lerp-pointer"];
        p.y += (p.ty - p.y) * motion["lerp-pointer"];
        px = p.x;
        py = p.y;
        elapsed = (performance.now() - start) / 1000;
      }

      for (const cell of cells) {
        const cx =
          lattice.originX + cellOffset(cell.col, panX, band.width, spanX);
        const cy = cellOffset(cell.row, panY, band.height, spanY);
        cell.setX(cx);
        cell.setY(cy);

        if (reducedMotion) continue;

        // Cells tile edge to edge, so at most a few are ever on screen. Tiles
        // in the rest keep their last offsets — nobody can see them, and
        // skipping the maths is what makes a 2D lattice affordable. The margin
        // only has to cover the drift and parallax amplitude, so that a cell is
        // already up to date by the time any of it is visible.
        const left = cx + band.minX;
        const top = cy + band.minY;
        if (left > vw + cull || left + band.width < -cull) continue;
        if (top > vh + cull || top + band.height < -cull) continue;

        for (const tile of cell.tiles) {
          const spec = tile.spec;
          if (!spec) continue;
          const depth = depths.get(spec.index) ?? motion["depth-min"];

          const screenX = cx + spec.x + spec.w / 2;
          const screenY = cy + spec.y + spec.h / 2;
          const fromCentreX = Math.max(-vw, Math.min(vw, screenX - halfVw));
          const fromCentreY = Math.max(-vh, Math.min(vh, screenY - halfVh));

          const phase = spec.index * 1.7 + cell.row * 0.9 + cell.col * 1.3;
          const period =
            motion["motion-drift"] +
            (spec.index % 5) * (motion["motion-drift-jitter"] / 5);
          const turn = (elapsed / period) * Math.PI * 2;
          const parallax = depth * motion["depth-pan-factor"];

          tile.setX(
            px * depth + fromCentreX * parallax + Math.sin(turn + phase) * amplitude,
          );
          tile.setY(
            py * depth +
              fromCentreY * parallax +
              Math.cos(turn + phase * 0.6) * amplitude,
          );
        }
      }
    };

    gsap.ticker.add(tick);
    tick();

    return () => {
      gsap.ticker.remove(tick);
      detachInput();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("keydown", onKeyDown);
      viewport.removeEventListener("focusin", onFocusIn);
      viewport.removeAttribute("data-panning");
    };
  }, [band, breakpoint, lattice, reducedMotion, notifyPan]);

  // ---- render ----------------------------------------------------------
  const cells = useMemo(() => {
    const out: Array<{ row: number; col: number }> = [];
    for (let row = 0; row < lattice.rows; row += 1) {
      for (let col = 0; col < lattice.cols; col += 1) out.push({ row, col });
    }
    return out;
  }, [lattice.rows, lattice.cols]);

  return (
    <div
      ref={viewportRef}
      className="vows-canvas fixed inset-0 z-[var(--z-canvas)] overflow-hidden"
      role="region"
      tabIndex={0}
      aria-label={copy.a11y.canvasLabel}
      aria-describedby="vows-canvas-hint"
    >
      <p id="vows-canvas-hint" className="sr-only-focusable">
        {copy.a11y.canvasHint}
      </p>

      {cells.map(({ row, col }) => {
        const primary = row === 0 && col === 0;
        return (
          <div
            key={`${breakpoint}-${row}-${col}`}
            data-cell=""
            data-cell-row={row}
            data-cell-col={col}
            className="absolute top-0 left-0 will-change-transform"
            aria-hidden={primary ? undefined : true}
            {...(primary ? {} : { inert: true })}
          >
            {band.tiles.map((tile) => (
              <PhotoTile
                key={tile.index}
                tile={tile}
                primary={primary}
                eager={primary && tile.y + tile.h > 0 && tile.y < 760}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

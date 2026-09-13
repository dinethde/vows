import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { PhotoTile } from "~/components/photo-tile";
import { useBreakpoint } from "~/hooks/use-breakpoint";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { readMotion } from "~/lib/motion";
import { copy } from "~/data/copy";
import { bands, type BandSpec, type Tile } from "~/data/tiles";

gsap.registerPlugin(ScrollTrigger);

type GalleryCanvasProps = {
  /** Fires once, on the visitor's first scroll gesture (DESIGN.md §4). */
  onFirstScroll: () => void;
};

type Lattice = { rows: number; cols: number[]; originX: number };

/**
 * Which lattice copies cover the viewport (DESIGN.md §3.2). One more row than
 * strictly needed, so a row only ever recycles while completely off screen.
 */
function computeLattice(band: BandSpec, vw: number, vh: number): Lattice {
  const originX = band.minX + (vw - band.designWidth) / 2;

  const cols: number[] = [];
  for (let c = -4; c <= 4; c += 1) {
    const left = originX + c * band.width;
    if (left < vw && left + band.width > 0) cols.push(c);
  }

  return {
    rows: Math.ceil((vh - band.minY) / band.height) + 1,
    cols: cols.length ? cols : [0],
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

function wrap(value: number, span: number) {
  return ((value % span) + span) % span;
}

/**
 * Where lattice row `slot` sits, in px, for a given scroll offset. Rows are
 * spaced one band apart and wrap over `span`; the band-height bias keeps the
 * topmost row at or above y = 0, so the viewport is always covered.
 */
function rowPosition(
  slot: number,
  offset: number,
  height: number,
  span: number,
) {
  return wrap(slot * height - offset + height, span) - height;
}

export function GalleryCanvas({ onFirstScroll }: GalleryCanvasProps) {
  const breakpoint = useBreakpoint();
  const reducedMotion = useReducedMotion();
  const band = bands[breakpoint];

  const viewportRef = useRef<HTMLDivElement>(null);
  const scroll = useRef({ target: 0, current: 0 });
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const hasScrolled = useRef(false);

  const [lattice, setLattice] = useState<Lattice>(() => ({
    rows: 2,
    cols: [0],
    originX: band.minX,
  }));

  const notifyScroll = useCallback(() => {
    if (hasScrolled.current) return;
    hasScrolled.current = true;
    onFirstScroll();
  }, [onFirstScroll]);

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

    // Only the base lattice row is on screen at load — the repeats sit a full
    // band above and below it — so only that row is worth animating in. It
    // halves the number of elements GSAP has to parse, and GSAP's per-target
    // style reads are what make the entrance the page's one costly moment.
    const tiles = Array.from(
      viewport.querySelectorAll<HTMLElement>('.vows-tile[data-row-slot="0"]'),
    );
    if (!tiles.length) return;

    const motion = readMotion();

    // Stagger order is computed from the tile table, never measured. GSAP's
    // `grid: "auto"` would read 44 bounding boxes between writes, which costs
    // a ~50ms forced reflow on a mid-range phone for no visual gain.
    const tileById = new Map(band.tiles.map((tile) => [tile.index, tile]));
    const span = lattice.rows * band.height;
    const centreX = window.innerWidth / 2;
    const centreY = window.innerHeight / 2;

    const frames: HTMLElement[] = [];
    const ranks: number[] = [];

    for (const node of tiles) {
      const frame = node.querySelector<HTMLElement>(".vows-tile-frame");
      const spec = tileById.get(Number(node.dataset.tile));
      if (!frame || !spec) continue;
      const slot = Number(node.dataset.rowSlot);
      const rowY = rowPosition(slot, 0, band.height, span);
      const dx =
        lattice.originX - band.minX + spec.x + spec.w / 2 - centreX;
      const dy = rowY + spec.y + spec.h / 2 - centreY;
      frames.push(frame);
      ranks.push(Math.hypot(dx, dy));
    }
    if (!frames.length) return;

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

  // ---- virtual scroll, parallax and drift -------------------------------
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const motion = readMotion();
    const depths = buildDepths(band, motion["depth-min"], motion["depth-max"]);
    const tileById = new Map(band.tiles.map((tile) => [tile.index, tile]));
    const span = lattice.rows * band.height;
    const amplitude =
      breakpoint === "mobile"
        ? motion["drift-amplitude-compact"]
        : motion["drift-amplitude"];

    const rows = Array.from(
      viewport.querySelectorAll<HTMLElement>("[data-band-row]"),
    ).map((el) => ({
      set: gsap.quickSetter(el, "y", "px") as (value: number) => void,
      slot: Number(el.dataset.bandRow),
    }));

    // GSAP has no `translate` shorthand, so x and y get a setter each.
    const tiles = Array.from(
      viewport.querySelectorAll<HTMLElement>(".vows-tile"),
    ).map((el) => ({
      setX: gsap.quickSetter(el, "x", "px") as (value: number) => void,
      setY: gsap.quickSetter(el, "y", "px") as (value: number) => void,
      spec: tileById.get(Number(el.dataset.tile)),
      slot: Number(el.dataset.rowSlot),
    }));

    // ---- input ---------------------------------------------------------
    const observer = ScrollTrigger.observe({
      target: window,
      type: "wheel,touch",
      wheelSpeed: 1,
      tolerance: 1,
      allowClicks: true,
      dragMinimum: 3,
      preventDefault: true,
      onChangeY: (self) => {
        scroll.current.target += self.deltaY;
        if (Math.abs(self.deltaY) > motion["reveal-threshold"]) notifyScroll();
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
      const target =
        node instanceof HTMLElement ? node : null;

      // Tabbing is intent too: without this the chrome would stay hidden for
      // a keyboard-only visitor, and the skip link would lead into an inert
      // navbar (DESIGN.md §4).
      if (event.key === "Tab") {
        notifyScroll();
        return;
      }

      const page = window.innerHeight * motion["key-page-ratio"];
      const step = motion["key-step"];
      let delta: number;

      switch (event.key) {
        case "ArrowDown":
          delta = step;
          break;
        case "ArrowUp":
          delta = -step;
          break;
        case "PageDown":
          delta = page;
          break;
        case "PageUp":
          delta = -page;
          break;
        case " ":
          if (
            target &&
            /^(BUTTON|A|INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
          )
            return;
          delta = event.shiftKey ? -page : page;
          break;
        case "Home":
          scroll.current.target = 0;
          notifyScroll();
          event.preventDefault();
          return;
        default:
          return;
      }

      scroll.current.target += delta;
      notifyScroll();
      event.preventDefault();
    };

    // Tabbing to a photograph pulls it into view (DESIGN.md §6).
    const onFocusIn = (event: FocusEvent) => {
      const tile = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        ".vows-tile",
      );
      if (!tile) return;
      const rect = tile.getBoundingClientRect();
      const margin = window.innerHeight * 0.15;
      if (rect.top < margin) {
        scroll.current.target -= margin - rect.top;
      } else if (rect.bottom > window.innerHeight - margin) {
        scroll.current.target += rect.bottom - (window.innerHeight - margin);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("keydown", onKeyDown);
    viewport.addEventListener("focusin", onFocusIn);

    // ---- frame ----------------------------------------------------------
    const start = performance.now();
    const positions = new Map<number, number>();

    // Hydration assumes motion is allowed, so a tick or two of drift can land
    // before the media query corrects. Clear it, or tiles sit a few px off.
    if (reducedMotion) {
      for (const tile of tiles) {
        tile.setX(0);
        tile.setY(0);
      }
    }

    const tick = () => {
      const state = scroll.current;
      state.current = reducedMotion
        ? state.target
        : state.current +
          (state.target - state.current) * motion["lerp-scroll"];

      for (const row of rows) {
        const position = rowPosition(
          row.slot,
          state.current,
          band.height,
          span,
        );
        positions.set(row.slot, position);
        row.set(position);
      }

      if (reducedMotion) return;

      const p = pointer.current;
      p.x += (p.tx - p.x) * motion["lerp-pointer"];
      p.y += (p.ty - p.y) * motion["lerp-pointer"];

      const elapsed = (performance.now() - start) / 1000;
      const vh = window.innerHeight;
      const halfVh = vh / 2;

      for (const tile of tiles) {
        const spec = tile.spec;
        if (!spec) continue;
        const depth = depths.get(spec.index) ?? motion["depth-min"];
        const rowY = positions.get(tile.slot) ?? 0;

        const screenY = rowY + spec.y + spec.h / 2;
        const fromCentre = Math.max(-vh, Math.min(vh, screenY - halfVh));

        const phase = spec.index * 1.7 + tile.slot * 0.9;
        const period =
          motion["motion-drift"] +
          (spec.index % 5) * (motion["motion-drift-jitter"] / 5);
        const turn = (elapsed / period) * Math.PI * 2;

        tile.setX(p.x * depth + Math.sin(turn + phase) * amplitude);
        tile.setY(
          p.y * depth +
            fromCentre * depth * motion["depth-scroll-factor"] +
            Math.cos(turn + phase * 0.6) * amplitude,
        );
      }
    };

    gsap.ticker.add(tick);
    tick();

    return () => {
      gsap.ticker.remove(tick);
      observer.kill();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("keydown", onKeyDown);
      viewport.removeEventListener("focusin", onFocusIn);
    };
  }, [band, breakpoint, lattice, reducedMotion, notifyScroll]);

  // ---- render ----------------------------------------------------------
  const slots = useMemo(
    () => Array.from({ length: lattice.rows }, (_, slot) => slot),
    [lattice.rows],
  );

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

      {slots.map((slot) => (
        <div
          key={`${breakpoint}-${slot}`}
          data-band-row={slot}
          className="absolute top-0 left-0 w-full will-change-transform"
        >
          {lattice.cols.map((col) => {
            const primary = slot === 0 && col === lattice.cols[0];
            return (
              <div
                key={col}
                className="absolute top-0 left-0"
                style={{
                  transform: `translate3d(${lattice.originX + col * band.width - band.minX}px, 0, 0)`,
                }}
                aria-hidden={primary ? undefined : true}
                {...(primary ? {} : { inert: true })}
              >
                {band.tiles.map((tile) => (
                  <PhotoTile
                    key={tile.index}
                    tile={tile}
                    slot={slot}
                    primary={primary}
                    eager={primary && tile.y + tile.h > 0 && tile.y < 760}
                  />
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

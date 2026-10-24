import { breakpointFor, HOME_FRAMES, spread, SPREAD } from './home-layout';
import type { HomeFrame } from './home-layout';

import {
  approach,
  depth,
  drift,
  followTarget,
  nudge,
  prefersReducedMotion,
  settle,
  wrap,
} from '@/lib/motion/float';
import type { Point } from '@/lib/motion/float';

const FRICTION = 0.94;
const KEY_STEP = 80;
const DRAG_THRESHOLD = 6;

interface Geometry {
  frame: HomeFrame;
  /** Base places of the visible tiles, in screen pixels. */
  bases: Point[];
  /** The size of one repeat of the canvas, and where it starts. */
  cell: Point;
  start: Point;
}

function measure(): Geometry {
  const { innerWidth: width, innerHeight: height } = window;
  const frame: HomeFrame = HOME_FRAMES[breakpointFor(width)];
  const widest = Math.max(...frame.tiles.map((tile) => tile[2]));
  const tallest = Math.max(...frame.tiles.map((tile) => tile[3])) + 24;
  // One repeat is the spread-out window plus room for the largest tile on each
  // side, so a tile is always fully off screen at the moment it wraps.
  const cell = { x: width * SPREAD + widest * 2, y: height * SPREAD + tallest * 2 };
  // The spread places reach SPREAD / 2 - 1 / 2 of a window past each edge.
  const reach = (SPREAD - 1) / 2;
  return {
    frame,
    bases: frame.tiles.map(([x, y]) => ({
      x: spread(x, frame.width) * width,
      y: spread(y, frame.height) * height,
    })),
    cell,
    start: { x: -widest - width * reach, y: -tallest - height * reach },
  };
}

/**
 * The endless canvas. One loop moves every tile: the wrap from scrolling or
 * dragging, the idle drift, the lean of the tiles near the pointer and the
 * whole canvas following where the pointer is are all one transform per tile,
 * and nothing else is animated.
 */
export class CanvasEngine {
  private geometry = measure();
  private offset: Point = { x: 0, y: 0 };
  private velocity: Point = { x: 0, y: 0 };
  private pushes: Point[] = [];
  private pointer: Point | null = null;
  private follow: Point = { x: 0, y: 0 };
  private followTo: Point = { x: 0, y: 0 };
  private drag: { last: Point; travelled: number } | null = null;
  private frameId = 0;
  private readonly still = prefersReducedMotion();
  private readonly stop = new AbortController();

  constructor(
    private readonly stage: HTMLElement,
    private readonly tiles: HTMLElement[],
    private readonly onMoved: () => void,
  ) {
    this.pushes = tiles.map(() => ({ x: 0, y: 0 }));
    const { signal } = this.stop;
    window.addEventListener('resize', this.onResize, { signal });
    stage.addEventListener('wheel', this.onWheel, { signal, passive: false });
    stage.addEventListener('pointerdown', this.onPointerDown, { signal });
    window.addEventListener('pointermove', this.onPointerMove, { signal });
    window.addEventListener('pointerup', this.onPointerUp, { signal });
    document.addEventListener('pointerleave', this.onPointerLeave, { signal });
    stage.addEventListener('keydown', this.onKeyDown, { signal });
    stage.addEventListener('click', this.onClick, { signal, capture: true });
    document.addEventListener('visibilitychange', this.onVisibility, { signal });
    this.frameId = requestAnimationFrame(this.tick);
  }

  destroy(): void {
    this.stop.abort();
    cancelAnimationFrame(this.frameId);
  }

  private readonly onResize = (): void => {
    this.geometry = measure();
  };

  private move(dx: number, dy: number): void {
    this.offset = { x: this.offset.x + dx, y: this.offset.y + dy };
    this.onMoved();
  }

  private readonly onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    this.move(event.deltaX, event.deltaY);
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    this.drag = { last: { x: event.clientX, y: event.clientY }, travelled: 0 };
    this.velocity = { x: 0, y: 0 };
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    const now = { x: event.clientX, y: event.clientY };
    if (this.drag) {
      const dx = now.x - this.drag.last.x;
      const dy = now.y - this.drag.last.y;
      this.drag = { last: now, travelled: this.drag.travelled + Math.abs(dx) + Math.abs(dy) };
      this.velocity = { x: -dx, y: -dy };
      this.move(-dx, -dy);
    } else if (this.pointer && event.pointerType === 'mouse' && !this.still) {
      this.lean({ x: now.x - this.pointer.x, y: now.y - this.pointer.y }, now);
    }
    if (event.pointerType === 'mouse' && !this.still) {
      this.followTo = followTarget(now, { x: window.innerWidth, y: window.innerHeight });
    }
    this.pointer = now;
  };

  /** The pointer has left the window: the canvas drifts back to the middle. */
  private readonly onPointerLeave = (): void => {
    this.followTo = { x: 0, y: 0 };
  };

  private readonly onPointerUp = (): void => {
    if (this.drag && this.drag.travelled < DRAG_THRESHOLD) this.velocity = { x: 0, y: 0 };
    // Kept for one click event, so a drag that ends on a tile does not open it.
    setTimeout(() => {
      this.drag = null;
    }, 0);
  };

  private readonly onClick = (event: MouseEvent): void => {
    if (this.drag && this.drag.travelled >= DRAG_THRESHOLD) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const steps: Record<string, Point> = {
      ArrowLeft: { x: -KEY_STEP, y: 0 },
      ArrowRight: { x: KEY_STEP, y: 0 },
      ArrowUp: { x: 0, y: -KEY_STEP },
      ArrowDown: { x: 0, y: KEY_STEP },
    };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    this.move(step.x, step.y);
  };

  private readonly onVisibility = (): void => {
    cancelAnimationFrame(this.frameId);
    if (!document.hidden) this.frameId = requestAnimationFrame(this.tick);
  };

  private lean(travel: Point, pointer: Point): void {
    this.pushes = this.pushes.map((push, index) => {
      const place = this.place(index);
      const tile = this.geometry.frame.tiles[index];
      if (!place || !tile) return push;
      const distance = Math.hypot(
        place.x + tile[2] / 2 - pointer.x,
        place.y + tile[3] / 2 - pointer.y,
      );
      return nudge(push, travel, distance);
    });
  }

  /** Where tile `index` is on screen right now, before drift and push. */
  private place(index: number): Point | null {
    const base = this.geometry.bases[index];
    if (!base) return null;
    const { cell, start } = this.geometry;
    return {
      x: wrap(base.x - this.offset.x, start.x, cell.x),
      y: wrap(base.y - this.offset.y, start.y, cell.y),
    };
  }

  private readonly tick = (time: number): void => {
    if (
      !this.drag &&
      !this.still &&
      (Math.abs(this.velocity.x) > 0.05 || Math.abs(this.velocity.y) > 0.05)
    ) {
      this.offset = { x: this.offset.x + this.velocity.x, y: this.offset.y + this.velocity.y };
      this.velocity = { x: this.velocity.x * FRICTION, y: this.velocity.y * FRICTION };
    }
    this.pushes = this.pushes.map(settle);
    this.follow = approach(this.follow, this.followTo);
    for (const [index, tile] of this.tiles.entries()) {
      const place = this.place(index);
      const base = this.geometry.bases[index];
      const push = this.pushes[index];
      if (!place || !base || !push) continue;
      const idle = this.still ? { x: 0, y: 0 } : drift(time, index);
      const lean = depth(index + 1);
      const x = place.x - base.x + idle.x + push.x + this.follow.x * lean;
      const y = place.y - base.y + idle.y + push.y + this.follow.y * lean;
      tile.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    }
    this.frameId = requestAnimationFrame(this.tick);
  };
}

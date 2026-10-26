import { approach, depth, drift, followTarget, nudge, prefersReducedMotion, settle } from "./float";
import type { Point } from "./float";

interface Item {
  element: HTMLElement;
  seed: number;
  push: Point;
  visible: boolean;
}

/**
 * Floats a set of elements: a slow drift, a lean the way the pointer is
 * travelling for the ones near it, and the whole set following where the
 * pointer is. One loop for all of them, running only while something is on
 * screen and the tab is in front. The home canvas has its own loop because it
 * also wraps; both use the same numbers from `float.ts`.
 */
export class FloatEngine {
  private readonly items = new Map<HTMLElement, Item>();
  private readonly watcher: IntersectionObserver;
  private readonly stop = new AbortController();
  private pointer: Point | null = null;
  private follow: Point = { x: 0, y: 0 };
  private followTo: Point = { x: 0, y: 0 };
  private frameId = 0;
  private seeds = 0;

  constructor() {
    this.watcher = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const item = this.items.get(entry.target as HTMLElement);
        if (item) item.visible = entry.isIntersecting;
      }
      this.schedule();
    });
    if (prefersReducedMotion()) return;
    window.addEventListener("pointermove", this.onPointerMove, { signal: this.stop.signal });
    document.addEventListener("pointerleave", this.onPointerLeave, { signal: this.stop.signal });
    document.addEventListener("visibilitychange", this.schedule, { signal: this.stop.signal });
  }

  add(element: HTMLElement): void {
    if (prefersReducedMotion() || this.items.has(element)) return;
    this.seeds += 1;
    this.items.set(element, { element, seed: this.seeds, push: { x: 0, y: 0 }, visible: false });
    this.watcher.observe(element);
  }

  destroy(): void {
    this.stop.abort();
    this.watcher.disconnect();
    cancelAnimationFrame(this.frameId);
    for (const { element } of this.items.values()) element.style.transform = "";
    this.items.clear();
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    const now = { x: event.clientX, y: event.clientY };
    // Touch has no pointer to follow, so those devices keep the drift alone.
    if (event.pointerType === "mouse") {
      this.followTo = followTarget(now, { x: window.innerWidth, y: window.innerHeight });
    }
    if (this.pointer && event.pointerType === "mouse") {
      const travel = { x: now.x - this.pointer.x, y: now.y - this.pointer.y };
      for (const item of this.items.values()) {
        if (!item.visible) continue;
        const box = item.element.getBoundingClientRect();
        const distance = Math.hypot(
          box.left + box.width / 2 - now.x,
          box.top + box.height / 2 - now.y,
        );
        item.push = nudge(item.push, travel, distance);
      }
    }
    this.pointer = now;
  };

  /** The pointer has left the window: the field drifts back to the middle. */
  private readonly onPointerLeave = (): void => {
    this.followTo = { x: 0, y: 0 };
  };

  private readonly schedule = (): void => {
    cancelAnimationFrame(this.frameId);
    const anyVisible = [...this.items.values()].some((item) => item.visible);
    if (anyVisible && !document.hidden) this.frameId = requestAnimationFrame(this.tick);
  };

  private readonly tick = (time: number): void => {
    this.follow = approach(this.follow, this.followTo);
    for (const item of this.items.values()) {
      if (!item.visible) continue;
      item.push = settle(item.push);
      const idle = drift(time, item.seed);
      const lean = depth(item.seed);
      const x = idle.x + item.push.x + this.follow.x * lean;
      const y = idle.y + item.push.y + this.follow.y * lean;
      item.element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    }
    this.frameId = requestAnimationFrame(this.tick);
  };
}

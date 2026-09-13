/**
 * The pan controller: one 2D offset, one smoothing pass, one inertia impulse.
 *
 * The canvas has no finite extent — it wraps on both axes — so there is nothing
 * for a scrollbar to represent and no document height that could stand in for
 * one. Input is read directly (GSAP's Observer) and integrated here; the page
 * itself never scrolls. See DESIGN.md §5.1.
 */

export type PanState = {
  /** Where the canvas is heading, in px. Input writes here. */
  targetX: number;
  targetY: number;
  /** Where it is now. The ticker eases this toward the target. */
  x: number;
  y: number;
};

export function createPan(): PanState {
  return { targetX: 0, targetY: 0, x: 0, y: 0 };
}

/**
 * Eases `x`/`y` toward the target. `lerp` of 1 snaps — which is what the
 * reduced-motion path asks for.
 */
export function advancePan(pan: PanState, lerp: number) {
  if (lerp >= 1) {
    pan.x = pan.targetX;
    pan.y = pan.targetY;
    return;
  }
  pan.x += (pan.targetX - pan.x) * lerp;
  pan.y += (pan.targetY - pan.y) * lerp;
}

/**
 * Converts a release velocity (px/sec) into a throw. Clamped so a violent
 * flick cannot send the canvas half a screen-height away in one frame.
 */
export function applyInertia(
  pan: PanState,
  velocityX: number,
  velocityY: number,
  seconds: number,
  max: number,
) {
  pan.targetX += clamp(velocityX * seconds, max);
  pan.targetY += clamp(velocityY * seconds, max);
}

function clamp(value: number, max: number) {
  return Math.max(-max, Math.min(max, value));
}

export function wrap(value: number, span: number) {
  return ((value % span) + span) % span;
}

/**
 * Where lattice cell `slot` sits on one axis, in px, for a given pan offset.
 * Cells are spaced one band apart and wrap over `span`; the one-band bias keeps
 * the leading cell at or before the viewport edge, so coverage never breaks.
 */
export function cellOffset(
  slot: number,
  pan: number,
  band: number,
  span: number,
) {
  return wrap(slot * band - pan + band, span) - band;
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

type PanInputOptions = {
  target: HTMLElement;
  pan: PanState;
  /** Wheel deltas are multiplied by this. */
  wheelSpeed: number;
  /** Movement, in px, that separates a click from a pan. */
  dragThreshold: number;
  /** Release velocity (px/s) is thrown this many seconds ahead. */
  inertiaSeconds: number;
  inertiaMax: number;
  /** Gesture distance, in px, that counts as intent (DESIGN.md §4). */
  revealThreshold: number;
  reducedMotion: boolean;
  onIntent: () => void;
  onDragChange: (dragging: boolean) => void;
};

/** A line of wheel scroll, in px, when deltaMode says lines rather than pixels. */
const LINE_HEIGHT = 16;
/** How far back velocity is sampled on release, in ms. */
const VELOCITY_WINDOW = 90;

/**
 * Wheel, trackpad, mouse drag and touch drag, all writing the same 2D target.
 *
 * This is deliberately hand-rolled rather than delegating to GSAP's Observer.
 * Observer applied only the first pointermove of a drag and never reported the
 * press, which made a mouse drag travel a few pixels and stop; and with the
 * canvas wrapping on both axes there is no scroll position for it to model
 * anyway. Pointer Events already unify mouse, touch and pen, so one path
 * covers all three.
 */
export function attachPanInput(options: PanInputOptions): () => void {
  const {
    target,
    pan,
    wheelSpeed,
    dragThreshold,
    inertiaSeconds,
    inertiaMax,
    revealThreshold,
    reducedMotion,
    onIntent,
    onDragChange,
  } = options;

  let pointerId: number | null = null;
  let lastX = 0;
  let lastY = 0;
  let travelled = 0;
  let samples: Array<{ t: number; dx: number; dy: number }> = [];
  /** True from the moment a press passes the threshold until the next press. */
  let dragged = false;

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    const scale =
      event.deltaMode === 1
        ? LINE_HEIGHT
        : event.deltaMode === 2
          ? window.innerHeight
          : 1;
    const dx = event.deltaX * scale * wheelSpeed;
    const dy = event.deltaY * scale * wheelSpeed;
    pan.targetX += dx;
    pan.targetY += dy;
    if (Math.hypot(dx, dy) > revealThreshold) onIntent();
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || pointerId !== null) return;
    pointerId = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    travelled = 0;
    dragged = false;
    samples = [];

    // Deliberately NOT setPointerCapture: capturing retargets the subsequent
    // click to the canvas, so tapping a photograph would never reach its link.
    // Listening on the window instead keeps a drag alive if the pointer leaves
    // the element, without touching event targeting.
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endPress);
    window.addEventListener("pointercancel", endPress);
    window.addEventListener("blur", abandonPress);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;

    // Dragging the canvas left moves the photographs left, like a map — which
    // is the opposite sign to a scroll offset.
    const dx = lastX - event.clientX;
    const dy = lastY - event.clientY;
    lastX = event.clientX;
    lastY = event.clientY;

    travelled += Math.hypot(dx, dy);
    if (!dragged && travelled > dragThreshold) {
      dragged = true;
      onDragChange(true);
    }
    if (!dragged) return;

    pan.targetX += dx;
    pan.targetY += dy;

    const now = event.timeStamp || performance.now();
    samples.push({ t: now, dx, dy });
    while (samples.length && now - samples[0]!.t > VELOCITY_WINDOW) {
      samples.shift();
    }

    if (travelled > revealThreshold) onIntent();
  };

  function releaseListeners() {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endPress);
    window.removeEventListener("pointercancel", endPress);
    window.removeEventListener("blur", abandonPress);
  }

  /** The window lost focus mid-press: stop panning, and throw nothing. */
  function abandonPress() {
    if (pointerId === null) return;
    pointerId = null;
    releaseListeners();
    if (dragged) onDragChange(false);
    samples = [];
  }

  function endPress(event: PointerEvent) {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    releaseListeners();
    if (!dragged) return;
    onDragChange(false);

    if (!reducedMotion && samples.length > 1) {
      const first = samples[0]!;
      const last = samples[samples.length - 1]!;
      const elapsed = (last.t - first.t) / 1000;
      if (elapsed > 0) {
        let dx = 0;
        let dy = 0;
        for (const sample of samples) {
          dx += sample.dx;
          dy += sample.dy;
        }
        applyInertia(pan, dx / elapsed, dy / elapsed, inertiaSeconds, inertiaMax);
      }
    }
    samples = [];
  }

  /**
   * Every tile is a link wrapping an image, and both are natively draggable.
   * Left alone, a drag that starts on a photograph becomes a browser link-drag:
   * the pointer stream is cancelled, the canvas stops panning, and no click
   * arrives either.
   */
  const onDragStart = (event: DragEvent) => event.preventDefault();

  /** A press that turned into a pan must not also activate the tile under it. */
  const onClickCapture = (event: MouseEvent) => {
    if (!dragged) return;
    event.preventDefault();
    event.stopPropagation();
    dragged = false;
  };

  target.addEventListener("wheel", onWheel, { passive: false });
  target.addEventListener("pointerdown", onPointerDown);
  target.addEventListener("dragstart", onDragStart);
  target.addEventListener("click", onClickCapture, { capture: true });

  return () => {
    releaseListeners();
    target.removeEventListener("wheel", onWheel);
    target.removeEventListener("pointerdown", onPointerDown);
    target.removeEventListener("dragstart", onDragStart);
    target.removeEventListener("click", onClickCapture, { capture: true });
  };
}

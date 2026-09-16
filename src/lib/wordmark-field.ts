/**
 * The footer wordmark as a field of characters (DESIGN.md §13.10).
 *
 * "Vows Weddings" is drawn as several hundred small glyphs standing where the
 * Mate letterforms have ink. From across the room it reads as the name; up
 * close it is a field of letters, digits and symbols that keeps reshuffling.
 *
 * No React and no DOM beyond the canvas it is handed, like `src/lib/pan.ts` —
 * which is what makes the simulation something you can reason about and drive
 * from a test without mounting a page.
 */

/** Uppercase, digits and a few symbols — the set the Figma note names. */
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#&$%+=";

/** One word as the DOM laid it out, in the canvas's own coordinates. */
export type WordBox = {
  text: string;
  /** Left edge of the word. */
  x: number;
  /** Alphabetic baseline. */
  baseline: number;
};

export type FieldConfig = {
  /** Distance between neighbouring characters, both axes. */
  pitch: number;
  /** Font size the characters are drawn at. */
  charSize: number;
  /** How much of a cell must be inked before it earns a character (0–1). */
  threshold: number;
  /** Extra weight added to the sampled letterforms before the grid reads them. */
  weight: number;
  /** Pointer repulsion reach and strength. */
  repelRadius: number;
  repelForce: number;
  /** Return-to-home spring and the drag that settles it. */
  spring: number;
  damping: number;
  /** A character holds its glyph for a random time in this range, in ms. */
  flickerMin: number;
  flickerMax: number;
  /** Fly-out from the centre line: travel time and the spread of start times. */
  entrance: number;
  entranceStagger: number;
  /** Sweep: pointer travel that triggers it, and how long the cloud holds. */
  sweepTravel: number;
  disperseImpulse: number;
  disperseHold: number;
};

export type FieldInput = {
  /** Words in canvas coordinates, already laid out by the browser. */
  words: WordBox[];
  /** The wordmark's own font, as a CSS `font` shorthand. */
  sourceFont: string;
  /** The mono stack the characters are drawn in. */
  charFont: string;
  /** Resolved ink colour — the token value, read from the DOM. */
  colour: string;
  width: number;
  height: number;
  dpr: number;
  config: FieldConfig;
};

type Particle = {
  /** Where the letterform wants it. */
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  /** Timestamp of this character's next glyph swap. */
  swapAt: number;
  /** Entrance offset, so the field unpacks in a wave rather than a pop. */
  delay: number;
};

export type WordmarkField = {
  /** Runs the entrance and starts the loop. Safe to call twice. */
  start: () => void;
  /** Halts the loop — used when the footer leaves the viewport. */
  stop: () => void;
  /** Pointer position in canvas coordinates, or null when it leaves. */
  setPointer: (x: number, y: number | null) => void;
  /** Blows the field apart; it reassembles on its own. */
  disperse: () => void;
  /** True while the animation loop holds a frame request. */
  isRunning: () => boolean;
  particleCount: () => number;
  dispose: () => void;
};

/**
 * Walks a grid over the rendered wordmark and keeps the cells with ink in
 * them. Sampling the real letterforms rather than approximating them is what
 * keeps the field in Mate's shapes — and in exactly the box the text occupies,
 * so the footer's three bands do not move.
 */
function sampleLetterforms(input: FieldInput): Particle[] {
  const { width, height, config } = input;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(width));
  canvas.height = Math.max(1, Math.ceil(height));

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return [];

  context.font = input.sourceFont;
  context.textBaseline = "alphabetic";
  context.fillStyle = input.colour;
  context.strokeStyle = input.colour;
  // Mate is a modulated serif: its hairlines are thinner than one grid cell,
  // so a straight fill leaves the thin strokes as a dotted line and the name
  // stops reading. Stroking the letterforms as well as filling them fattens
  // every stroke to at least a couple of cells while keeping the shapes and
  // the axis — the alternative, a finer grid, buys the same density at three
  // times the particle count.
  context.lineWidth = config.weight;
  context.lineJoin = "round";
  context.lineCap = "round";
  for (const word of input.words) {
    context.fillText(word.text, word.x, word.baseline);
    if (config.weight > 0) context.strokeText(word.text, word.x, word.baseline);
  }

  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const pitch = Math.max(2, config.pitch);
  const particles: Particle[] = [];

  // Nine samples per cell rather than one at the centre: a single probe drops
  // whole rows out of a thin stroke and leaves the letterforms ragged.
  const probes = [0.2, 0.5, 0.8];

  for (let cy = pitch / 2; cy < height; cy += pitch) {
    for (let cx = pitch / 2; cx < width; cx += pitch) {
      let inked = 0;
      let taken = 0;
      for (const py of probes) {
        for (const px of probes) {
          const sx = Math.round(cx + (px - 0.5) * pitch);
          const sy = Math.round(cy + (py - 0.5) * pitch);
          if (sx < 0 || sy < 0 || sx >= canvas.width || sy >= canvas.height) continue;
          inked += data[(sy * canvas.width + sx) * 4 + 3]! / 255;
          taken += 1;
        }
      }
      if (taken === 0 || inked / taken < config.threshold) continue;

      particles.push({
        hx: cx,
        hy: cy,
        x: cx,
        y: cy,
        vx: 0,
        vy: 0,
        char: ALPHABET[Math.floor(Math.random() * ALPHABET.length)]!,
        swapAt: 0,
        delay: 0,
      });
    }
  }

  return particles;
}

export function createWordmarkField(
  canvas: HTMLCanvasElement,
  input: FieldInput,
): WordmarkField {
  const context = canvas.getContext("2d");
  const { config, width, height, dpr } = input;

  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));

  const particles = sampleLetterforms(input);
  const centreY = height / 2;
  const centreX = width / 2;
  const halfWidth = Math.max(1, width / 2);

  for (const particle of particles) {
    // The entrance starts packed in a thin line at the wordmark's middle, so
    // the field unfolds out of the text's own centre rather than drifting in.
    particle.y = centreY;
    particle.x = particle.hx;
    // Outer characters leave last, which reads as the name spreading open.
    particle.delay =
      (Math.abs(particle.hx - centreX) / halfWidth) * config.entranceStagger;
  }

  let frame = 0;
  let last = 0;
  let entranceAt = 0;
  let pointerX = 0;
  let pointerY = 0;
  let pointerIn = false;
  let travel = 0;
  let disperseUntil = 0;

  const flicker = (now: number) =>
    now + config.flickerMin + Math.random() * (config.flickerMax - config.flickerMin);

  const draw = () => {
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    context.fillStyle = input.colour;
    context.font = `${config.charSize}px ${input.charFont}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    for (const particle of particles) {
      context.fillText(particle.char, particle.x, particle.y);
    }
  };

  const step = (now: number) => {
    const elapsed = last === 0 ? 1 : (now - last) / (1000 / 60);
    // Clamped: a backgrounded tab hands back one enormous delta, which would
    // fling every particle off the canvas before the springs could answer.
    const dt = Math.min(Math.max(elapsed, 0.2), 3);
    last = now;

    const sinceEntrance = now - entranceAt;
    const scattered = now < disperseUntil;
    const spring = scattered ? config.spring * 0.25 : config.spring;

    for (const particle of particles) {
      if (particle.swapAt === 0) particle.swapAt = flicker(now);
      if (now >= particle.swapAt) {
        particle.char = ALPHABET[Math.floor(Math.random() * ALPHABET.length)]!;
        particle.swapAt = flicker(now);
      }

      // Still packed in the centre line, waiting its turn to fly out.
      if (sinceEntrance < particle.delay) continue;

      if (pointerIn) {
        const dx = particle.x - pointerX;
        const dy = particle.y - pointerY;
        const distance = Math.hypot(dx, dy);
        if (distance < config.repelRadius && distance > 0) {
          // Squared falloff: a soft edge to the hole, a hard centre.
          const push = (1 - distance / config.repelRadius) ** 2 * config.repelForce;
          particle.vx += (dx / distance) * push * dt;
          particle.vy += (dy / distance) * push * dt;
        }
      }

      particle.vx += (particle.hx - particle.x) * spring * dt;
      particle.vy += (particle.hy - particle.y) * spring * dt;
      particle.vx *= config.damping ** dt;
      particle.vy *= config.damping ** dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
    }

    draw();
    frame = requestAnimationFrame(step);
  };

  return {
    start() {
      if (frame !== 0) return;
      const now = performance.now();
      entranceAt = now;
      last = 0;
      frame = requestAnimationFrame(step);
    },
    stop() {
      if (frame === 0) return;
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    },
    setPointer(x, y) {
      if (y === null) {
        pointerIn = false;
        travel = 0;
        return;
      }
      if (pointerIn) {
        travel += Math.hypot(x - pointerX, y - pointerY);
        // Dragging the length of the name throws the whole field open.
        if (travel > config.sweepTravel) {
          travel = 0;
          this.disperse();
        }
      }
      pointerX = x;
      pointerY = y;
      pointerIn = true;
    },
    disperse() {
      const now = performance.now();
      disperseUntil = now + config.disperseHold;
      for (const particle of particles) {
        const dx = particle.x - centreX;
        const dy = particle.y - centreY;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const kick = config.disperseImpulse * (0.5 + Math.random());
        particle.vx += (dx / distance) * kick;
        particle.vy += (dy / distance) * kick;
      }
    },
    isRunning: () => frame !== 0,
    particleCount: () => particles.length,
    dispose() {
      this.stop();
      particles.length = 0;
    },
  };
}

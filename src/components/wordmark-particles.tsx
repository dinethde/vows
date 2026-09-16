import { useEffect, useRef, type RefObject } from "react";

import {
  createWordmarkField,
  type FieldConfig,
  type WordBox,
  type WordmarkField,
} from "~/lib/wordmark-field";

/**
 * Wires the character field (DESIGN.md §13.10) to the wordmark's own box.
 *
 * The canvas is decoration: it sits over the real heading, which keeps the
 * studio's name in the markup for search engines and screen readers. Nothing
 * here changes the footer's geometry — the canvas is absolutely positioned
 * inside the text's box and measured from it, so the three bands and the
 * one-screen height are exactly as they were.
 */
export function WordmarkParticles({
  hostRef,
}: {
  /** The span holding the two words — the box the field fills. */
  hostRef: RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let field: WordmarkField | null = null;
    let visible = false;
    let entered = false;

    const build = () => {
      field?.dispose();
      field = null;

      const box = host.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) return;

      const style = getComputedStyle(host);
      const number = (name: string) =>
        Number.parseFloat(style.getPropertyValue(name));

      const config: FieldConfig = {
        pitch: number("--wordmark-particle-pitch"),
        charSize: number("--wordmark-particle-size"),
        threshold: number("--wordmark-particle-threshold"),
        weight: number("--wordmark-particle-weight"),
        repelRadius: number("--wordmark-repel-radius"),
        repelForce: number("--wordmark-repel-force"),
        spring: number("--wordmark-spring"),
        damping: number("--wordmark-damping"),
        flickerMin: number("--wordmark-flicker-min"),
        flickerMax: number("--wordmark-flicker-max"),
        entrance: number("--wordmark-entrance"),
        entranceStagger: number("--wordmark-entrance-stagger"),
        sweepTravel: number("--wordmark-sweep-travel"),
        disperseImpulse: number("--wordmark-disperse-impulse"),
        disperseHold: number("--wordmark-disperse-hold"),
      };
      if (Object.values(config).some((value) => !Number.isFinite(value))) return;

      // The words as the browser placed them — one line on desktop and tablet,
      // two on mobile — so the field never re-implements text layout and can
      // never disagree with the heading underneath it.
      const sourceFont = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} / ${style.lineHeight} ${style.fontFamily}`;
      const probe = document.createElement("canvas").getContext("2d");
      if (!probe) return;
      probe.font = sourceFont;

      const metrics = probe.measureText(host.textContent ?? "");
      const ascent = metrics.fontBoundingBoxAscent;
      const descent = metrics.fontBoundingBoxDescent;

      const words: WordBox[] = [...host.querySelectorAll("span")].map((word) => {
        const rect = word.getBoundingClientRect();
        return {
          text: word.textContent ?? "",
          x: rect.left - box.left,
          // Half-leading: the glyph box is centred in the line box, so the
          // baseline sits this far down from the line box's top edge.
          baseline: rect.top - box.top + (rect.height - (ascent + descent)) / 2 + ascent,
        };
      });
      if (words.length === 0) return;

      field = createWordmarkField(canvas, {
        words,
        sourceFont,
        charFont: style.getPropertyValue("--font-mono").trim(),
        // The token, not the computed colour: the heading's own ink is turned
        // transparent while the canvas draws it, and sampling a transparent
        // wordmark finds no letterforms at all.
        colour: style.getPropertyValue("--color-ink").trim(),
        width: box.width,
        height: box.height,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        config,
      });

      canvas.style.width = `${box.width}px`;
      canvas.style.height = `${box.height}px`;

      if (visible) {
        entered = true;
        field.start();
      }
    };

    build();

    // The entrance plays when the footer arrives, not on page load, and the
    // loop stops the moment it leaves — an rAF running under a gallery nobody
    // is looking at is pure battery.
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[entries.length - 1]!.isIntersecting;
        if (visible) {
          entered = true;
          field?.start();
        } else {
          field?.stop();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(host);

    let resizeFrame = 0;
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        const wasEntered = entered;
        build();
        // A resize re-samples the letterforms; replaying the fly-in every time
        // the window edge moves would be seasick, so it starts settled.
        if (wasEntered) field?.disperse();
      });
    });
    resizeObserver.observe(host);

    const onPointerMove = (event: PointerEvent) => {
      if (!field || !visible) return;
      const box = host.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      const margin = Number.parseFloat(
        getComputedStyle(host).getPropertyValue("--wordmark-repel-radius"),
      );
      const inside =
        x > -margin && y > -margin && x < box.width + margin && y < box.height + margin;
      field.setPointer(x, inside ? y : null);
    };

    const onPointerLeave = () => field?.setPointer(0, null);

    // `pointermove` covers both: a mouse hovering and a finger dragging, which
    // is what gives touch devices the push rather than nothing (§13.10).
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointercancel", onPointerLeave, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave, { passive: true });

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointercancel", onPointerLeave);
      document.removeEventListener("pointerleave", onPointerLeave);
      field?.dispose();
    };
  }, [hostRef]);

  return <canvas ref={canvasRef} aria-hidden className="vows-wordmark-canvas" />;
}

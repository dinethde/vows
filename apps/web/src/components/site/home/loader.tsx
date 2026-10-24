'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';

import { scramble } from './scramble';
import type { Phase } from './scramble';

import { prefersReducedMotion } from '@/lib/motion/float';

const LINES = ['Wedding photography & videography', 'VOWS Weddings', 'Colombo, Sri Lanka'] as const;
const KEY = 'vows:loaded';
const IN_MS = 900;
/** Long enough for the decode to finish; the page being ready ends it sooner than the ceiling. */
const HOLD_MIN_MS = 1200;
const HOLD_MAX_MS = 3000;
const OUT_MS = 650;

function seenThisVisit(): boolean {
  try {
    return window.sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

function remember(): void {
  try {
    window.sessionStorage.setItem(KEY, '1');
  } catch {
    // Private mode. It simply plays again on the next page load.
  }
}

function phaseAt(
  elapsed: number,
  holdMs: number,
): { phase: Phase; progress: number; done: boolean } {
  if (elapsed < IN_MS) return { phase: 'in', progress: elapsed / IN_MS, done: false };
  if (elapsed < IN_MS + holdMs) return { phase: 'hold', progress: 1, done: false };
  const out = (elapsed - IN_MS - holdMs) / OUT_MS;
  return { phase: 'out', progress: out, done: out >= 1 };
}

interface Decode {
  gone: boolean;
  leaving: boolean;
  spans: React.RefObject<(HTMLSpanElement | null)[]>;
}

/** Runs the decode on the clock and the page's load event, both outside React. */
function useDecode(): Decode {
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const spans = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (seenThisVisit()) {
      setGone(true);
      return;
    }
    const still = prefersReducedMotion();
    const started = performance.now();
    let holdMs = HOLD_MAX_MS;
    const ready = (): void => {
      holdMs = Math.max(HOLD_MIN_MS, Math.min(HOLD_MAX_MS, performance.now() - started - IN_MS));
    };
    if (document.readyState === 'complete') ready();
    else window.addEventListener('load', ready, { once: true });

    let frame = 0;
    const tick = (now: number): void => {
      const { phase, progress, done } = phaseAt(now - started, holdMs);
      for (const [index, span] of spans.current.entries()) {
        const text = LINES[index];
        if (span && text) span.textContent = still ? text : scramble(text, phase, progress);
      }
      if (phase === 'out') setLeaving(true);
      if (done) {
        remember();
        setGone(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('load', ready);
    };
  }, []);

  return { gone, leaving, spans };
}

/**
 * Three lines that decode, hold, and undo themselves before the site appears.
 * The middle one sits exactly where the home page's title is, so the name does
 * not jump. A reader hears the real words once; the symbols are never read out.
 */
export function Loader(): ReactElement | null {
  const { gone, leaving, spans } = useDecode();
  if (gone) return null;
  const line =
    'type-ui-caption text-secondary tablet:flex hidden items-center gap-[10px] whitespace-pre';
  return (
    <div
      className={`bg-page px-space-5 tablet:px-space-8 fixed inset-0 z-[60] flex items-center justify-between transition-opacity duration-[450ms] ${leaving ? 'opacity-0' : 'opacity-100'}`}
    >
      <p className="sr-only">{LINES.join('. ')}</p>
      <p aria-hidden="true" className={line}>
        <span className="rounded-pill bg-(--vows-color-orange-500) size-[8px]" />
        <span
          ref={(node) => {
            spans.current[0] = node;
          }}
        />
      </p>
      <p
        aria-hidden="true"
        className="type-heading-2 text-heading absolute left-1/2 top-[calc(50%-34px)] -translate-x-1/2 whitespace-pre"
      >
        <span
          ref={(node) => {
            spans.current[1] = node;
          }}
        />
      </p>
      <p aria-hidden="true" className={line}>
        <span
          ref={(node) => {
            spans.current[2] = node;
          }}
        />
        <span className="bg-accent rounded-pill size-[8px]" />
      </p>
    </div>
  );
}

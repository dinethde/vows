'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { showBars } from './bars-store';
import { CanvasEngine } from './canvas-engine';
import { homeCss } from './home-layout';

export interface HomeTile {
  /** Unique on the canvas: the album, and which of its photographs. */
  key: string;
  href: string;
  /** The couple's names, shown under the photograph. */
  label: string;
  picture: ReactNode;
}

export interface HomeCanvasProps {
  tiles: HomeTile[];
}

/**
 * The portfolio as one endless canvas. It can be scrolled, dragged or moved
 * with the arrow keys, and it wraps, so there is no first photograph and no
 * last. Every tile is a link, in a list, so it also works with no pointer.
 */
export function HomeCanvas({ tiles }: HomeCanvasProps): ReactElement {
  const stage = useRef<HTMLDivElement>(null);

  // The canvas lives outside React: one loop that writes one transform a tile.
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const engine = new CanvasEngine(
      element,
      [...element.querySelectorAll<HTMLElement>('[data-tile]')],
      showBars,
    );
    return () => {
      engine.destroy();
    };
  }, [tiles.length]);

  return (
    <div
      ref={stage}
      role="region"
      aria-label="Albums. Scroll, drag or use the arrow keys to move around."
      className="absolute inset-0 cursor-grab touch-none select-none overflow-clip active:cursor-grabbing"
    >
      <style>{homeCss()}</style>
      <ul>
        {tiles.map((tile, index) => (
          <li key={tile.key}>
            <Link
              href={tile.href}
              data-tile
              draggable={false}
              className={`tile-${String(index)} absolute flex-col gap-[5px] will-change-transform`}
            >
              {tile.picture}
              <span className="type-ui-label-s text-primary">{tile.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

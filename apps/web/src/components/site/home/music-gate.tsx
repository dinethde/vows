'use client';

import type { ReactElement, ReactNode } from 'react';

import { useMusic } from '@/components/site/music/music-provider';

export interface MusicGateProps {
  children: ReactNode;
}

const BARS = ['h-[6px]', 'h-[12px]', 'h-[16px]', 'h-[10px]', 'h-[5px]'];

/**
 * The first-load choice. A browser will not play sound until the page has been
 * touched, so the home page asks: the photographs blur, and one line offers
 * the music. Clicking anywhere turns it on; the quieter line carries on
 * without it. Asked once a visit, and nothing is downloaded before the answer.
 */
export function MusicGate({ children }: MusicGateProps): ReactElement {
  const { choice, choose } = useMusic();
  const asking = choice === null;

  return (
    <>
      <div
        className={`absolute inset-0 transition-[filter] duration-[400ms] motion-reduce:transition-none ${asking ? 'blur-[6px]' : ''}`}
        {...(asking ? { inert: true } : {})}
      >
        {children}
      </div>
      {asking ? (
        <div
          className="bg-page/30 absolute inset-0 z-20 flex flex-col items-center justify-center"
          onClick={() => {
            choose('on');
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') choose('off');
          }}
        >
          {/* The whole screen is the target, but a keyboard and a screen reader need a real button. */}
          <button
            type="button"
            autoFocus
            aria-label="Turn on the music"
            className="bg-surface/86 border-hairline shadow-modal rounded-pill tablet:type-nav-legal type-body-xs text-primary gap-space-3 px-space-5 tablet:tracking-[1.4px] flex min-h-[44px] items-center border uppercase tracking-[1.2px]"
          >
            <span aria-hidden="true" className="flex h-[16px] items-center gap-[2px]">
              {BARS.map((height, index) => (
                <span
                  key={height}
                  className={`bg-inverse animate-meter w-[2px] origin-center rounded-[1px] motion-reduce:animate-none ${height}`}
                  style={{ animationDelay: `${String(index * 120)}ms` }}
                />
              ))}
            </span>
            <span className="tablet:inline hidden">Click anywhere to turn on the music</span>
            <span className="tablet:hidden">Tap anywhere to turn on the music</span>
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              choose('off');
            }}
            className="type-body-xs text-secondary tablet:bottom-[8svh] absolute bottom-[14svh] flex min-h-[44px] items-center uppercase tracking-[1.2px] underline"
          >
            Continue without the music
          </button>
        </div>
      ) : null}
    </>
  );
}

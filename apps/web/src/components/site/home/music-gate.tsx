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
          {/* The whole screen is the target, but a keyboard and a screen reader need a real button.
              Figma sets it a little above the middle, at 48.5 per cent of the height. */}
          <button
            type="button"
            autoFocus
            aria-label="Turn on the music"
            className="bg-surface/86 border-hairline shadow-modal rounded-pill tablet:type-nav-legal type-body-xs text-primary tablet:gap-space-3 tablet:min-h-[51px] tablet:pr-[26px] tablet:pl-space-6 tablet:tracking-[1.4px] relative -top-[1.5svh] flex min-h-[46px] items-center gap-[10px] border pl-[21px] pr-[22px] uppercase tracking-[1.2px]"
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
            <span className="desktop:inline hidden">Click anywhere to turn on the music</span>
            <span className="desktop:hidden">Tap anywhere to turn on the music</span>
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              choose('off');
            }}
            className="type-body-xs text-secondary tablet:bottom-[72px] absolute bottom-[46px] flex min-h-[46px] items-center uppercase tracking-[1.2px] underline"
          >
            Continue without the music
          </button>
        </div>
      ) : null}
    </>
  );
}

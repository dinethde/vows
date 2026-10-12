import type { ReactElement } from 'react';

import { CtaButton } from '../cta-button';
import { cn } from '../lib/cn';
import { focusRing } from '../lib/focus';

import { ErrorCard } from './error-card';
import type { ErrorScreenProps } from './error-screen.types';

/* The numeral and the card share one box so the card stays on the middle
 * digit. A phone uses the 200 numeral and the 72 card; the desktop the 460
 * numeral and the 164 card. Between 640 and 1024 the desktop box is drawn at
 * 65 per cent, which is "scale the numeral between the two sizes" without a
 * one-off font size. */
const zone = cn(
  'relative h-[179px] w-full max-w-[342px]',
  'tablet:h-[381px] tablet:w-[860px] tablet:max-w-none tablet:[zoom:0.65] desktop:[zoom:1]',
);

const numeral = cn(
  'absolute inset-x-0 top-[18px] pl-space-3 text-center whitespace-nowrap text-ghost tablet:pl-[28px]',
  'type-display-error-code-mobile tablet:top-[15px] tablet:type-display-error-code',
);

const homeLinkClasses = cn(
  'relative type-body-xs text-secondary underline tablet:type-body-s',
  'before:absolute before:-inset-x-space-2 before:-inset-y-[13px]',
  focusRing,
);

export function ErrorScreen({
  code,
  headline,
  subline,
  card,
  caption,
  primaryAction,
  homeLink,
  linkComponent: Link = 'a',
  className,
}: ErrorScreenProps): ReactElement {
  return (
    <div
      className={cn(
        'gap-space-6 px-space-6 flex w-full flex-1 flex-col items-center justify-center pb-[28px]',
        'tablet:gap-space-8 tablet:pb-space-9 desktop:px-space-10',
        className,
      )}
    >
      <div className="tablet:gap-[73px] flex w-full flex-col items-center gap-[34px]">
        <div
          aria-hidden="true"
          className="tablet:gap-[10px] flex w-full flex-col items-center gap-[7.5px]"
        >
          <div className={zone}>
            <span className={numeral}>{code}</span>
            <span className="tablet:top-[189px] absolute left-1/2 top-[94px] -translate-x-1/2">
              <ErrorCard variant={card} className="tablet:[zoom:1] [zoom:0.44]" />
            </span>
          </div>
          <span className="type-body-xs text-muted">{caption}</span>
        </div>
        <div className="tablet:gap-[14px] flex flex-col items-center gap-[10px] text-center">
          <h1 className="type-heading-3 text-heading tablet:type-display-hero-s max-w-[900px]">
            {headline}
          </h1>
          <p className="type-body-s text-muted tablet:max-w-[620px] tablet:type-body-m max-w-[312px]">
            {subline}
          </p>
        </div>
      </div>
      <div className="gap-space-5 tablet:flex-row tablet:gap-[28px] flex flex-col items-center">
        {'href' in primaryAction ? (
          <CtaButton asChild>
            <Link href={primaryAction.href}>{primaryAction.label}</Link>
          </CtaButton>
        ) : (
          <CtaButton onClick={primaryAction.onClick}>{primaryAction.label}</CtaButton>
        )}
        <Link href={homeLink.href} className={homeLinkClasses}>
          {homeLink.label}
        </Link>
      </div>
    </div>
  );
}

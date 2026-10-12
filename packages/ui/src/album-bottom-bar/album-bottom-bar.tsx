import type { ReactElement, ReactNode } from 'react';

import { bottomBackdrop } from '../lib/bar';
import { cn } from '../lib/cn';

import type { AlbumBottomBarProps } from './album-bottom-bar.types';

/* The bar hugs its content and has no fixed height. A phone stacks three
 * lines, a tablet two rows, and a desktop puts all four parts on one line with
 * the paragraph taking the leftover width. Side padding 20 / 32 / 64. */
const bar = cn(
  'relative isolate flex w-full flex-col gap-space-3 px-space-5 py-space-3 text-primary',
  'tablet:gap-space-4 tablet:px-space-7',
  'desktop:flex-row desktop:items-center desktop:gap-space-9 desktop:px-space-10',
);

/* On a desktop this row dissolves, so the names, the paragraph and the details
 * become three siblings of the bar and `order` can put the paragraph between. */
const row = cn(
  'relative flex flex-col gap-space-3',
  'tablet:flex-row tablet:items-center tablet:justify-between',
  'desktop:contents',
);

function Detail({ label, children }: { label: string; children: ReactNode }): ReactElement {
  return (
    <div className="flex flex-col items-center">
      <dt className="type-meta-field-label">({label})</dt>
      <dd className="type-body-s tablet:type-body-m text-center">{children}</dd>
    </div>
  );
}

export function AlbumBottomBar({
  coupleNames,
  intro,
  type,
  place,
  timeOfDay,
  date,
  dateTime,
  labels,
  headingLevel: Heading = 'h1',
  className,
}: AlbumBottomBarProps): ReactElement {
  return (
    <div className={cn(bar, className)}>
      <span aria-hidden="true" className={bottomBackdrop} />
      <div className={row}>
        <Heading className="type-heading-3 desktop:order-1 relative shrink-0">
          {coupleNames}
        </Heading>
        <dl className="gap-space-6 desktop:order-3 relative flex shrink-0 flex-wrap justify-between">
          <Detail label={labels.type}>{type}</Detail>
          <Detail label={labels.place}>{place}</Detail>
          <Detail label={timeOfDay}>
            <time dateTime={dateTime}>{date}</time>
          </Detail>
        </dl>
      </div>
      <p className="type-body-s tablet:type-body-m desktop:order-2 desktop:min-w-0 desktop:flex-1 relative">
        {intro}
      </p>
    </div>
  );
}

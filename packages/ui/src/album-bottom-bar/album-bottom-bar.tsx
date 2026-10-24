import type { ReactElement } from 'react';

import { albumBackdrop } from '../lib/bar';
import { cn } from '../lib/cn';

import type { AlbumBottomBarDetailProps, AlbumBottomBarProps } from './album-bottom-bar.types';

/* Figma `2289:7026`. The bar hugs its content and has no fixed height. A
 * phone stacks three lines, a tablet two rows, and a desktop puts all four
 * parts on one line with the paragraph taking the leftover width. Side
 * padding 20 / 32 / 64. Only the names are required; an empty field is left
 * out and the rest close up. */
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

/* Each caption sits on the left edge of its value, as the redrawn bar has them. */
function Detail({ label, children }: AlbumBottomBarDetailProps): ReactElement {
  return (
    <div className="flex flex-col items-start">
      <dt className="type-meta-field-label">({label})</dt>
      <dd className="type-body-s tablet:type-body-m whitespace-nowrap">{children}</dd>
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
  // An empty string is as good as missing here, so these test for any text.
  const hasDetails = [type, place, date].some(Boolean);
  return (
    <div className={cn(bar, className)}>
      <span aria-hidden="true" className={albumBackdrop} />
      <div className={row}>
        <Heading className="type-heading-3 desktop:order-1 relative shrink-0">
          {coupleNames}
        </Heading>
        {hasDetails ? (
          <dl className="gap-x-space-6 gap-y-space-6 desktop:order-3 relative flex shrink-0 flex-wrap justify-between">
            {type ? <Detail label={labels.type}>{type}</Detail> : null}
            {place ? <Detail label={labels.place}>{place}</Detail> : null}
            {date ? (
              <Detail label={timeOfDay ? timeOfDay : (labels.date ?? 'date')}>
                <time dateTime={dateTime}>{date}</time>
              </Detail>
            ) : null}
          </dl>
        ) : null}
      </div>
      {intro ? (
        <p className="type-body-s tablet:type-body-m desktop:order-2 desktop:min-w-0 desktop:flex-1 relative">
          {intro}
        </p>
      ) : null}
    </div>
  );
}

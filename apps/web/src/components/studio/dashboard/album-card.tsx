import type { StudioAlbumSummary } from '@vows/contracts';
import { cn, PhotoSlot, StatusPill } from '@vows/ui';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { MoveToDraft } from './move-to-draft';

import { focusRing } from '@/components/studio/focus';
import { thumbFor } from '@/components/studio/photo-thumb';
import { isLive, pillFor } from '@/components/studio/stage';
import { albumPath } from '@/lib/auth/constants';
import { fullDate } from '@/lib/format/dates';

export interface AlbumCardProps {
  album: StudioAlbumSummary;
}

/** The widest a card is drawn: one per row on a phone. */
const CARD_WIDTH = 640;

/**
 * The picture, or the same dashed slot the editor uses when there is none, so
 * "needs filling" looks the same everywhere. Here the slot is only a picture
 * of itself: the whole card is the link, and it is the link that is read out.
 */
function CardImage({ album }: AlbumCardProps): ReactElement {
  if (!album.cover || album.cover.status !== 'ready') {
    return (
      <div inert className="pointer-events-none absolute inset-0">
        <PhotoSlot state="Empty" />
      </div>
    );
  }
  const thumb = thumbFor(album.cover, CARD_WIDTH);
  return (
    <>
      {thumb.placeholderSrc ? (
        <img
          src={thumb.placeholderSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      {thumb.src ? (
        <img
          src={thumb.src}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
    </>
  );
}

/**
 * One album on the dashboard. The title is the link and its hit area is
 * stretched over the whole card, so there is one tab stop per album and the
 * picture is not announced twice.
 */
export function AlbumCard({ album }: AlbumCardProps): ReactElement {
  const title = album.coupleNames ?? album.title;
  const pill = pillFor(album.stage);

  return (
    <li className="gap-space-2 relative flex flex-col">
      <div className="bg-slot relative flex aspect-[240/190] w-full overflow-clip">
        <CardImage album={album} />
        <StatusPill state={pill} className="top-space-2 left-space-2 absolute" />
      </div>
      <div className="gap-space-3 flex items-start justify-between px-px">
        <div className="gap-space-1 flex min-w-0 flex-col">
          <p className="type-studio-overline-s text-muted min-h-[13.5px] truncate">
            {album.location ?? ''}
          </p>
          <h3 className="type-studio-title text-heading">
            <Link
              href={albumPath(album.id)}
              className={cn('after:absolute after:inset-0', focusRing)}
              aria-label={`${title}, ${pill}. Edit this album`}
            >
              {title}
            </Link>
          </h3>
        </div>
        {album.shotOn ? (
          <time
            dateTime={album.shotOn}
            className="type-studio-overline-s text-muted shrink-0 whitespace-nowrap"
          >
            {fullDate(album.shotOn)}
          </time>
        ) : null}
      </div>
      {isLive(album.stage) ? <MoveToDraft albumId={album.id} title={title} /> : null}
    </li>
  );
}

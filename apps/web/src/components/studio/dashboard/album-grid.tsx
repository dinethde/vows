import type { StudioAlbumSummary } from '@vows/contracts';
import { Button } from '@vows/ui';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { AlbumCard } from './album-card';
import { FILTER_LABELS } from './view';
import type { DashboardView } from './view';

export interface AlbumGridProps {
  albums: StudioAlbumSummary[];
  view: DashboardView;
}

function emptyMessage({ filter, query }: DashboardView): string {
  if (query) return `No album matches “${query}”.`;
  return `No album is ${FILTER_LABELS[filter].toLowerCase()} at the moment.`;
}

/** Four cards across on a desktop, three on a tablet, one on a phone. */
export function AlbumGrid({ albums, view }: AlbumGridProps): ReactElement {
  if (albums.length === 0) {
    return (
      <div className="border-card gap-space-4 p-space-8 flex flex-col items-start border border-dashed">
        <p className="type-studio-body-l text-secondary">{emptyMessage(view)}</p>
        <Button asChild variant="outline">
          <Link href="/studio">Show every album</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="gap-space-4 desktop:gap-space-6 tablet:grid-cols-3 desktop:grid-cols-4 grid grid-cols-1">
      {albums.map((album) => (
        <AlbumCard key={album.id} album={album} />
      ))}
    </ul>
  );
}

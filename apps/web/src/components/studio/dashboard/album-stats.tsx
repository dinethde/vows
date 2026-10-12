import type { StudioAlbumList } from '@vows/contracts';
import type { ReactElement } from 'react';

export interface AlbumStatsProps {
  /** From the API, worked out by the same query as the cards. Never counted here. */
  counts: StudioAlbumList['counts'];
}

const STATS: { key: keyof StudioAlbumList['counts']; label: string; caption: string }[] = [
  { key: 'all', label: 'All', caption: 'Stories in your collection' },
  { key: 'published', label: 'Published', caption: 'Visible on your website' },
  { key: 'draft', label: 'Draft', caption: 'Waiting to be completed' },
  { key: 'untouched', label: 'Untouched', caption: 'Waiting to be added' },
];

/** Figma writes every count with two digits: 01, 03, 18. */
function twoDigits(count: number): string {
  return String(count).padStart(2, '0');
}

/**
 * The four counts. One row from the tablet up, two by two on a phone. No box
 * has a minimum width: the grid decides, and a caption may wrap.
 */
export function AlbumStats({ counts }: AlbumStatsProps): ReactElement {
  return (
    <dl className="border-card tablet:w-fit tablet:grid-cols-4 grid w-full grid-cols-2 border-l border-t">
      {STATS.map((stat) => (
        <div
          key={stat.key}
          className="border-card px-space-4 tablet:px-[30px] tablet:py-space-6 flex flex-col border-b border-r py-[18px]"
        >
          <dt className="type-studio-overline text-muted">{stat.label}</dt>
          <dd className="pt-space-2 type-studio-stat text-heading">
            {twoDigits(counts[stat.key])}
          </dd>
          <dd className="type-studio-caption text-muted pt-[5px]">{stat.caption}</dd>
        </div>
      ))}
    </dl>
  );
}

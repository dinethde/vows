import type { StudioAlbumSummary } from '@vows/contracts';

import { fullDate } from '@/lib/format/dates';

export const FILTERS = ['all', 'published', 'draft', 'untouched'] as const;
export type Filter = (typeof FILTERS)[number];

export const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  published: 'Published',
  draft: 'Draft',
  untouched: 'Untouched',
};

/** What the dashboard is showing. Both parts live in the URL, so a refresh keeps them. */
export interface DashboardView {
  filter: Filter;
  query: string;
}

type Params = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

export function parseView(params: Params): DashboardView {
  const stage = first(params.stage);
  const filter = FILTERS.find((known) => known === stage) ?? 'all';
  return { filter, query: first(params.q).trim().slice(0, 80) };
}

/** `all` and an empty search are left out, so the plain dashboard has a plain address. */
export function dashboardHref({ filter, query }: DashboardView): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (filter !== 'all') params.set('stage', filter);
  return params.size > 0 ? `/studio?${params.toString()}` : '/studio';
}

/** An archived album is off the website, so it is listed with the drafts. */
function inFilter(album: StudioAlbumSummary, filter: Filter): boolean {
  if (filter === 'all') return true;
  const stage = album.stage === 'archived' ? 'draft' : album.stage;
  return stage === filter;
}

function matches(album: StudioAlbumSummary, query: string): boolean {
  if (!query) return true;
  const haystack = [
    album.coupleNames,
    album.title,
    album.location,
    album.slug,
    album.shotOn ? fullDate(album.shotOn) : null,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}

/** The cards to draw. The four counts never come from here: the API sends them. */
export function visibleAlbums(
  albums: StudioAlbumSummary[],
  view: DashboardView,
): StudioAlbumSummary[] {
  return albums.filter((album) => inFilter(album, view.filter) && matches(album, view.query));
}

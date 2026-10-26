import type { Metadata } from "next";

import { AlbumGrid } from '@/components/studio/dashboard/album-grid';
import { AlbumStats } from '@/components/studio/dashboard/album-stats';
import { CollectionToolbar } from '@/components/studio/dashboard/collection-toolbar';
import { DashboardNavigationProvider } from '@/components/studio/dashboard/dashboard-navigation';
import { parseView, visibleAlbums } from '@/components/studio/dashboard/view';
import { serverApi } from '@/lib/auth/server';

import { AlbumGrid } from "@/components/studio/dashboard/album-grid";
import { AlbumStats } from "@/components/studio/dashboard/album-stats";
import { CollectionToolbar } from "@/components/studio/dashboard/collection-toolbar";
import { parseView, visibleAlbums } from "@/components/studio/dashboard/view";
import { serverApi } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Albums" };

export interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * All 22 albums at a glance. The counts and the cards come from one request,
 * so they cannot disagree. The search and the filter are read from the
 * address, which is why this page needs no script to work. With one, they
 * change through a transition, so only the grid waits for the new list.
 */
export default async function DashboardPage({
  searchParams,
}: DashboardPageProps): Promise<ReactElement> {
  const view = parseView(await searchParams);
  const list = await serverApi().albums.listForStudio();

  return (
    <div className="gap-space-8 px-space-5 py-space-8 tablet:px-space-7 desktop:px-[clamp(32px,14vw,200px)] flex flex-col">
      <section className="gap-space-6 flex flex-col">
        <div className="gap-space-1 flex flex-col">
          <p className="type-studio-overline text-muted">VOWS</p>
          <h1 className="type-studio-display text-heading py-space-1">Albums</h1>
          <p className="type-studio-body-l text-muted">
            Create and curate the stories behind every celebration.
          </p>
        </div>
        <AlbumStats counts={list.counts} />
      </section>
      <DashboardNavigationProvider>
        <section className="gap-space-6 flex flex-col">
          <CollectionToolbar view={view} total={list.counts.all} />
          <AlbumGrid albums={visibleAlbums(list.data, view)} view={view} />
        </section>
      </DashboardNavigationProvider>
    </div>
  );
}

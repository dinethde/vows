import { albumId } from "@vows/contracts";
import type { StudioAlbum } from "@vows/contracts";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { ReactElement } from "react";

import { AlbumEditor } from "@/components/studio/editor/album-editor";
import { ApiError } from "@/lib/api";
import { serverApi } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Edit album" };

export interface AlbumPageProps {
  params: Promise<{ id: string }>;
}

/** An id that is not one of the 22 is a 404, not an error screen. */
async function load(id: string): Promise<StudioAlbum> {
  if (!albumId.safeParse(id).success) notFound();
  try {
    return await serverApi().albums.getForStudio(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

/**
 * The editor for one album. The album is read here, on the server, so the
 * form is filled in on the first paint. From then on the editor keeps the
 * photographs fresh itself, because they change while the worker runs.
 */
export default async function AlbumPage({ params }: AlbumPageProps): Promise<ReactElement> {
  const album = await load((await params).id);
  return <AlbumEditor key={album.id} album={album} />;
}

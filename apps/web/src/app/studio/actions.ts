"use server";

import { albumId, photoId, reorderPhotos, updateAlbum, updatePhoto } from "@vows/contracts";
import type { Photo, StudioAlbum, UpdateAlbum } from "@vows/contracts";

import { invalid, toResult } from "@/components/studio/action-result";
import type { ActionResult } from "@/components/studio/action-result";
import { serverApi } from "@/lib/auth/server";

/*
 * Every change the Studio makes goes through one of these. Each one checks
 * what it was sent, calls the API with the signed-in person's token, and
 * answers with the new state or the API's refusal. Nothing is revalidated
 * here: on publish and unpublish the API queues the rebuild itself.
 */

const BAD_ID = "That album or photograph could not be found.";
const BAD_BODY = "Some of what was sent could not be read. Reload the page and try again.";

export async function saveAlbum(
  id: string,
  changes: UpdateAlbum,
): Promise<ActionResult<StudioAlbum>> {
  const target = albumId.safeParse(id);
  const body = updateAlbum.safeParse(changes);
  if (!target.success) return invalid(BAD_ID);
  if (!body.success) return invalid(BAD_BODY);
  return toResult(serverApi().albums.update(target.data, body.data));
}

/** Saves the edits first, so what goes live is what is on the screen. */
export async function publishAlbum(
  id: string,
  changes: UpdateAlbum | null,
): Promise<ActionResult<StudioAlbum>> {
  const target = albumId.safeParse(id);
  if (!target.success) return invalid(BAD_ID);
  if (changes !== null) {
    const saved = await saveAlbum(target.data, changes);
    if (!saved.ok) return saved;
  }
  return toResult(serverApi().albums.publish(target.data));
}

export async function unpublishAlbum(id: string): Promise<ActionResult<StudioAlbum>> {
  const target = albumId.safeParse(id);
  if (!target.success) return invalid(BAD_ID);
  return toResult(serverApi().albums.unpublish(target.data));
}

export async function describePhoto(id: string, alt: string | null): Promise<ActionResult<Photo>> {
  const target = photoId.safeParse(id);
  const body = updatePhoto.safeParse({ alt });
  if (!target.success) return invalid(BAD_ID);
  if (!body.success) return invalid("A description can be up to 300 characters long.");
  return toResult(serverApi().photos.update(target.data, body.data));
}

export async function removePhoto(id: string): Promise<ActionResult<null>> {
  const target = photoId.safeParse(id);
  if (!target.success) return invalid(BAD_ID);
  return toResult(
    serverApi()
      .photos.remove(target.data)
      .then(() => null),
  );
}

export async function reorderAlbumPhotos(
  id: string,
  slots: (string | null)[],
): Promise<ActionResult<Photo[]>> {
  const target = albumId.safeParse(id);
  const body = reorderPhotos.safeParse({ slots });
  if (!target.success) return invalid(BAD_ID);
  if (!body.success) return invalid(BAD_BODY);
  return toResult(serverApi().photos.reorder(target.data, body.data));
}

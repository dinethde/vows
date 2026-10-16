import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Photo } from '@vows/contracts';
import { useState } from 'react';

import { movePhoto } from './reorder';
import type { Reordered } from './reorder';

import { describePhoto, removePhoto, reorderAlbumPhotos } from '@/app/studio/actions';
import { studioKeys } from '@/components/studio/query-keys';

export interface Removal {
  /** The photograph the modal is asking about, or null when it is closed. */
  photo: Photo | null;
  pending: boolean;
  /** The API's refusal, shown inside the modal. */
  error: string | undefined;
  ask: (photo: Photo) => void;
  cancel: () => void;
  confirm: () => void;
}

export interface PhotoMutations {
  /** Saves a description. Resolves with the sentence to show if it was refused. */
  describe: (photo: Photo, alt: string) => Promise<string | null>;
  move: (from: number, to: number) => void;
  /** Why the last move was undone, or null. */
  moveError: string | null;
  removal: Removal;
}

interface MoveContext {
  previous: Photo[] | undefined;
}

function useMove(albumId: string): Pick<PhotoMutations, 'move' | 'moveError'> {
  const queryClient = useQueryClient();
  const key = studioKeys.photos(albumId);
  const [moveError, setMoveError] = useState<string | null>(null);

  const mutation = useMutation<Photo[], Error, Reordered, MoveContext>({
    mutationFn: async ({ slots }) => {
      const result = await reorderAlbumPhotos(albumId, slots);
      if (!result.ok) throw new Error(result.message);
      return result.data;
    },
    // The slots change places at once. If the API refuses, they change back.
    onMutate: async ({ photos }) => {
      setMoveError(null);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Photo[]>(key);
      queryClient.setQueryData(key, photos);
      return { previous };
    },
    onError: (error, _moved, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      setMoveError(`The photographs are back where they were. ${error.message}`);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  return {
    moveError,
    move: (from, to) => {
      const moved = movePhoto(queryClient.getQueryData<Photo[]>(key) ?? [], from, to);
      if (moved) mutation.mutate(moved);
    },
  };
}

function useRemoval(albumId: string): Removal {
  const queryClient = useQueryClient();
  const key = studioKeys.photos(albumId);
  const [photo, setPhoto] = useState<Photo | null>(null);

  const mutation = useMutation<null, Error, Photo>({
    mutationFn: async (target) => {
      const result = await removePhoto(target.id);
      if (!result.ok) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (_gone, target) => {
      queryClient.setQueryData<Photo[]>(key, (now) =>
        (now ?? []).filter((entry) => entry.id !== target.id),
      );
      setPhoto(null);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  return {
    photo,
    pending: mutation.isPending,
    error: mutation.error?.message,
    ask: (target) => {
      mutation.reset();
      setPhoto(target);
    },
    cancel: () => {
      setPhoto(null);
    },
    confirm: () => {
      if (photo) mutation.mutate(photo);
    },
  };
}

/** Everything that changes a photograph once it is in the album. */
export function usePhotoMutations(albumId: string): PhotoMutations {
  const queryClient = useQueryClient();
  const key = studioKeys.photos(albumId);

  const describe = async (photo: Photo, alt: string): Promise<string | null> => {
    const result = await describePhoto(photo.id, alt.trim() === '' ? null : alt.trim());
    if (!result.ok) return result.fields.alt ?? result.message;
    queryClient.setQueryData<Photo[]>(key, (now) =>
      (now ?? []).map((entry) =>
        entry.id === result.data.id ? { ...entry, alt: result.data.alt } : entry,
      ),
    );
    return null;
  };

  return { describe, ...useMove(albumId), removal: useRemoval(albumId) };
}

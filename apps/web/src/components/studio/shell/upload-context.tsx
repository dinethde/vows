'use client';

import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useState, useSyncExternalStore } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { useApi } from './api-context';

import { studioKeys } from '@/components/studio/query-keys';
import type { ApiClient } from '@/lib/api';
import { putFile } from '@/lib/upload/put-file';
import { UploadQueue } from '@/lib/upload/queue';
import type { Rejection, UploadItem, UploadState } from '@/lib/upload/queue';

const UploadContext = createContext<UploadQueue | null>(null);

const NOTHING: UploadState = { items: [], rejections: [] };

export interface UploadProviderProps {
  children: ReactNode;
}

interface Holder {
  api: ApiClient;
}

/**
 * One queue for the whole Studio, made once and kept in the layout. Moving
 * from the editor to the dashboard leaves this mounted, so a file that is
 * half way there keeps going.
 */
export function UploadProvider({ children }: UploadProviderProps): ReactElement {
  const api = useApi();
  const queryClient = useQueryClient();
  // The queue outlives any one render, so it reads the client through a box
  // that always holds the current one.
  const [holder] = useState<Holder>(() => ({ api }));
  holder.api = api;
  const [queue] = useState(
    () =>
      new UploadQueue({
        uploadUrl: (albumId, body, key) => holder.api.photos.uploadUrl(albumId, body, key),
        markUploaded: (photoId) => holder.api.photos.markUploaded(photoId),
        put: putFile,
        settled: (albumId) =>
          queryClient.invalidateQueries({ queryKey: studioKeys.photos(albumId) }),
        newKey: () => crypto.randomUUID(),
      }),
  );
  return <UploadContext.Provider value={queue}>{children}</UploadContext.Provider>;
}

export function useUploadQueue(): UploadQueue {
  const queue = useContext(UploadContext);
  if (!queue) throw new Error('useUploadQueue must be used inside the Studio layout.');
  return queue;
}

export interface AlbumUploads {
  items: UploadItem[];
  rejections: Rejection[];
}

/** The uploads that belong to one album, as they are right now. */
export function useAlbumUploads(albumId: string): AlbumUploads {
  const queue = useUploadQueue();
  const state = useSyncExternalStore(queue.subscribe, queue.getState, () => NOTHING);
  return {
    items: state.items.filter((item) => item.albumId === albumId),
    rejections: state.rejections.filter((entry) => entry.albumId === albumId),
  };
}

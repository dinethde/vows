'use client';

import { createContext, useContext } from 'react';

import type { Problems } from './publish-problems';
import type { AlbumPhotos } from './use-album-photos';
import type { PhotoMutations } from './use-photo-mutations';

export interface SlotsContextValue {
  photos: AlbumPhotos;
  mutations: PhotoMutations;
  /** What is stopping the album going out, once Publish has been pressed. Empty before. */
  problems: Problems;
}

const SlotsContext = createContext<SlotsContextValue | null>(null);

export const SlotsProvider = SlotsContext.Provider;

/** The 19 slots are drawn in two different layouts; both read the same state here. */
export function useSlots(): SlotsContextValue {
  const value = useContext(SlotsContext);
  if (!value) throw new Error('useSlots must be used inside the album editor.');
  return value;
}

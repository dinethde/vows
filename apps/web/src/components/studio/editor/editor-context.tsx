'use client';

import { createContext, useContext } from 'react';

import type { AlbumEditorState } from './use-album-editor';

const EditorContext = createContext<AlbumEditorState | null>(null);

export const EditorProvider = EditorContext.Provider;

/** The editor's state, for the parts of the screen that draw it. */
export function useEditor(): AlbumEditorState {
  const value = useContext(EditorContext);
  if (!value) throw new Error('useEditor must be used inside the album editor.');
  return value;
}

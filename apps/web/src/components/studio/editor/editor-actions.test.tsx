import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { EditorActions } from './editor-actions';
import { EditorProvider } from './editor-context';
import type { AlbumEditorState } from './use-album-editor';
import type { EditorButton } from './use-editor-actions';

import { albumWith } from '@/components/studio/fixtures';

function renderActions(busy: EditorButton | null): void {
  const editor = { album: albumWith([]), blockedBy: 0, actions: { busy, pending: busy !== null } };
  render(
    <EditorProvider value={editor as unknown as AlbumEditorState}>
      <EditorActions publishFirst />
    </EditorProvider>,
  );
}

const busy = (name: string): string | null =>
  screen.getByRole('button', { name }).getAttribute('aria-busy');

afterEach(cleanup);

describe('the editor’s buttons while their work runs', () => {
  it('spins Draft alone while a draft saves', () => {
    renderActions('draft');
    expect(busy('Draft')).toBe('true');
    expect(busy('Publish')).toBeNull();
  });

  it('spins Publish alone while publishing is checked', () => {
    renderActions('publish');
    expect(busy('Publish')).toBe('true');
    expect(busy('Draft')).toBeNull();
  });
});

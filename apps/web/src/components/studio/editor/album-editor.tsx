"use client";

import type { ReactElement } from "react";

import { AlbumPreview } from './album-preview';
import { DetailsForm } from './details-form';
import { EditorActions } from './editor-actions';
import { EditorProvider } from './editor-context';
import { BackToAlbums, EditorHead } from './editor-head';
import { EditorModals } from './editor-modals';
import { FormBanner } from './form-banner';
import { PhotoGrid } from './photo-grid';
import { SlotsProvider } from './slots-context';
import { useAlbumEditor } from './use-album-editor';
import { useIsDesktop } from './use-is-desktop';

export interface AlbumEditorProps {
  /** The album as the server page read it. The editor keeps it up to date from there. */
  album: StudioAlbum;
  /** The dashboard as it was left, for every way out of the editor. */
  backHref: string;
}

/** Until the window's width is known, the slots' place is held and says so. */
function PhotosLoading(): ReactElement {
  return (
    <p role="status" className="type-studio-body-l text-muted p-space-8 flex-1 text-center">
      Loading the photographs…
    </p>
  );
}

function DetailsHeading(): ReactElement {
  return (
    <div className="flex flex-col">
      <h2 className="type-studio-subheading text-heading">Album details</h2>
      <p className="type-studio-body-s text-muted pt-space-1">
        The essential information shown on the album page.
      </p>
    </div>
  );
}

/**
 * The album editor. On a desktop the details sit in a column on the left and
 * the album page is previewed on the right. Below 1024 there is no room for
 * the preview, so it is edit-first: the head and the buttons, the details,
 * then every slot in a plain grid.
 *
 * On a desktop the editor is exactly as tall as the window under the Studio's
 * bar and does not scroll itself: the details and the preview each scroll on
 * their own, so the buttons and the album stay side by side.
 */
export function AlbumEditor({ album, backHref }: AlbumEditorProps): ReactElement {
  const editor = useAlbumEditor(album, backHref);
  const desktop = useIsDesktop();
  const names = editor.album.coupleNames ?? editor.album.title;

  return (
    <EditorProvider value={editor}>
      <SlotsProvider
        value={{ photos: editor.photos, mutations: editor.mutations, problems: editor.shown }}
      >
        <div className="gap-space-6 p-space-5 tablet:gap-space-7 tablet:px-space-7 tablet:py-space-6 desktop:flex-row desktop:items-start desktop:gap-space-4 desktop:p-space-4 desktop:pt-space-8 desktop:h-[calc(100svh-var(--studio-bar))] desktop:overflow-hidden flex flex-col">
          <h1 className="desktop:sr-only desktop:block hidden">Edit the album {names}</h1>
          <div className="gap-space-4 tablet:flex-row tablet:items-end tablet:justify-between desktop:hidden flex flex-col">
            <EditorHead />
            <EditorActions publishFirst={false} className="tablet:w-[374px]" />
          </div>
          <div className="desktop:flex desktop:max-h-full desktop:w-[307px] desktop:shrink-0 desktop:flex-col desktop:gap-space-3 contents">
            <BackToAlbums className="desktop:block hidden self-start" />
            <form
              noValidate
              aria-label="Album details"
              className="gap-space-6 desktop:bg-surface desktop:relative desktop:min-h-0 desktop:overflow-y-auto desktop:p-space-3 flex flex-col"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <div className="gap-space-4 flex flex-col">
                <DetailsHeading />
                <FormBanner />
              </div>
              <DetailsForm />
              <EditorActions publishFirst className="desktop:flex hidden" />
            </form>
          </div>
          {desktop === null ? <PhotosLoading /> : null}
          {desktop === true ? <AlbumPreview /> : null}
          {desktop === false ? <PhotoGrid /> : null}
        </div>
        <EditorModals />
      </SlotsProvider>
    </EditorProvider>
  );
}

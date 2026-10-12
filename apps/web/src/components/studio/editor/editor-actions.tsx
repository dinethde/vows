'use client';

import { Button, cn } from '@vows/ui';
import { useId } from 'react';
import type { ReactElement } from 'react';

import { ADDRESS_PREFIX } from './details-copy';
import { useEditor } from './editor-context';
import { blockedNote } from './publish-problems';

import { focusRing } from '@/components/studio/focus';
import { env } from '@/config/env';
import { fullDate } from '@/lib/format/dates';

export interface EditorActionsProps {
  /** Publish above the other two, as in the desktop sidebar. Below the desktop
   * width Figma draws Cancel and Draft first, with Publish under them. */
  publishFirst: boolean;
  className?: string;
}

export interface PublishNoteProps {
  id: string;
}

/** Why the faded Publish button will not go. Read out with the button at all times. */
function PublishNote({ id }: PublishNoteProps): ReactElement | null {
  const { blockedBy, revealed } = useEditor();
  if (blockedBy === 0) return null;
  return (
    <p id={id} className={cn('type-studio-caption text-placeholder', !revealed && 'sr-only')}>
      {blockedNote(blockedBy)}
    </p>
  );
}

/** When the album went live and where. The address opens the real page. */
function PublishStamp(): ReactElement | null {
  const { album, justPublished } = useEditor();
  if (album.stage !== 'published' || !album.publishedAt) return null;
  const when = justPublished ? 'just now' : `on ${fullDate(album.publishedAt.slice(0, 10))}`;
  return (
    <p className="type-studio-caption text-placeholder">
      Last published {when} ·{' '}
      <a
        href={`${env.SITE_URL.replace(/\/$/, '')}/albums/${album.slug}`}
        target="_blank"
        rel="noreferrer"
        className={cn('underline', focusRing)}
      >
        {ADDRESS_PREFIX}
        {album.slug}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </p>
  );
}

/**
 * Publish, Draft and Cancel. Publish fades while something is missing, but it
 * is never disabled: it stays in the tab order, says why through its
 * description, and pressing it shows what to fix and moves there.
 */
export function EditorActions({ publishFirst, className }: EditorActionsProps): ReactElement {
  const { actions, blockedBy, album } = useEditor();
  const noteId = useId();
  const blocked = blockedBy > 0;

  const publish = (
    <Button
      className={cn('w-full', blocked && 'opacity-65')}
      aria-describedby={blocked ? noteId : undefined}
      pending={actions.pending && actions.modal === null}
      onClick={actions.pressPublish}
    >
      Publish
    </Button>
  );
  const others = (
    <div className="gap-space-3 flex">
      <Button variant="outline" onClick={actions.pressLeave}>
        Cancel
      </Button>
      <Button variant="neutral" className="flex-1" onClick={actions.pressDraft}>
        {album.stage === 'published' ? 'Move to draft' : 'Draft'}
      </Button>
    </div>
  );

  return (
    <div className={cn('gap-space-3 flex flex-col', className)}>
      {publishFirst ? <PublishNote id={noteId} /> : others}
      {publishFirst ? publish : <PublishNote id={noteId} />}
      {publishFirst ? others : publish}
      <PublishStamp />
    </div>
  );
}

import type { ConfirmationModalTone } from '@vows/ui';

export interface ConfirmationCopy {
  tone: ConfirmationModalTone;
  title: string;
  message: string;
  confirmLabel: string;
}

/**
 * The four confirmations, word for word from the Figma scenarios. There is no
 * delete-album: the set of albums is fixed. Saving, typing, reordering and
 * uploading never ask, because each can be undone.
 */
export const CONFIRMATIONS = {
  publish: {
    tone: 'primary',
    title: 'Publish this album?',
    message:
      'It goes live on vows.lk and the album page is rebuilt, usually within a minute. You can move it back to draft at any time.',
    confirmLabel: 'Publish album',
  },
  moveToDraft: {
    tone: 'primary',
    title: 'Move this album back to draft?',
    message:
      'It comes off vows.lk within a minute, and anyone holding the link will see the not-found page. Nothing is deleted — you can publish it again whenever you like.',
    confirmLabel: 'Move to draft',
  },
  deletePhoto: {
    tone: 'danger',
    title: 'Delete this photograph?',
    message:
      'It is removed from this album and from vows.lk. The original file stays in private storage, so nothing you shot is lost — but putting it back means uploading it again.',
    confirmLabel: 'Delete photograph',
  },
  discard: {
    tone: 'danger',
    title: 'Discard your changes?',
    message:
      'Everything you have edited since the last save will be lost. The published version of the album is not affected.',
    confirmLabel: 'Discard changes',
  },
} as const satisfies Record<string, ConfirmationCopy>;

export type ConfirmationKind = keyof typeof CONFIRMATIONS;

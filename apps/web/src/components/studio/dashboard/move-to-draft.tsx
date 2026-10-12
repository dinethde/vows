'use client';

import { cn, ConfirmationModal } from '@vows/ui';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { ReactElement } from 'react';

import { unpublishAlbum } from '@/app/studio/actions';
import { CONFIRMATIONS } from '@/components/studio/confirmations';
import { focusRing } from '@/components/studio/focus';
import { usePortalContainer } from '@/components/studio/shell/studio-providers';

export interface MoveToDraftProps {
  albumId: string;
  /** The couple's names, so the button says which album it means. */
  title: string;
}

/* Drawn the size of a status pill. `before` takes the hit area to 44. */
const trigger = cn(
  'top-space-2 right-space-2 h-space-6 px-space-2 type-studio-badge absolute z-10 flex cursor-pointer items-center',
  'bg-surface text-secondary before:absolute before:-inset-[10px]',
  focusRing,
);

/**
 * Takes a live album off the website, from its card on the dashboard. It asks
 * first: the album's link stops working for anyone who has it.
 */
export function MoveToDraft({ albumId, title }: MoveToDraftProps): ReactElement {
  const router = useRouter();
  const container = usePortalContainer();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const confirm = (): void => {
    startTransition(async () => {
      const result = await unpublishAlbum(albumId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        className={trigger}
        aria-label={`Move ${title} back to draft`}
        onClick={() => {
          setError(undefined);
          setOpen(true);
        }}
      >
        Move to draft
      </button>
      <ConfirmationModal
        {...CONFIRMATIONS.moveToDraft}
        open={open}
        pending={pending}
        {...(error === undefined ? {} : { error })}
        container={container}
        onConfirm={confirm}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </>
  );
}

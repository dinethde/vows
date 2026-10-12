'use client';

import {
  CtaButton,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@vows/ui';
import dynamic from 'next/dynamic';
import type { ReactElement } from 'react';

/** Shown for the moment it takes the form's code to arrive, so the dialog is never unnamed. */
function Loading(): ReactElement {
  return (
    <div role="status" className="flex flex-col gap-[56px]">
      <DialogTitle className="type-heading-3 tablet:type-heading-2 text-primary">
        Let’s talk.
      </DialogTitle>
      <DialogDescription className="type-body-m text-secondary">One moment.</DialogDescription>
    </div>
  );
}

const EnquiryFormBody = dynamic(
  () => import('./enquiry-form-body').then((module) => module.EnquiryFormBody),
  {
    ssr: false,
    loading: Loading,
  },
);

const card =
  'gap-[56px] p-space-6 tablet:p-space-8 inset-x-0! bottom-0! max-h-[calc(100svh-56px)] overflow-y-auto rounded-t-[24px] rounded-b-none tablet:w-[560px] tablet:rounded-[24px] tablet:max-h-[calc(100svh-48px)] shadow-[0_16px_48px_0_color-mix(in_srgb,var(--vows-color-ink-900)_12%,transparent)] tablet:right-auto! tablet:left-1/2! tablet:bottom-auto!';

/**
 * "Let's talk" does not go to another page. The page dims and the form sits on
 * top: a card on a desktop and a tablet, a sheet from the bottom on a phone.
 * The keyboard stays inside it, Escape closes it, and focus returns to the
 * button that opened it.
 */
export function EnquiryDialog(): ReactElement {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <CtaButton>Let’s talk</CtaButton>
      </DialogTrigger>
      <DialogContent
        className={card}
        overlayClassName="bg-scrim/45"
        // The form puts focus in its first field when its code arrives.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
        // With the month open under the date field, Escape closes the month.
        onEscapeKeyDown={(event) => {
          if (document.querySelector('[data-month-open="true"]')) event.preventDefault();
        }}
      >
        <EnquiryFormBody />
      </DialogContent>
    </Dialog>
  );
}

'use client';

import {
  CtaButton,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@vows/ui';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { EnquiryFieldList } from './enquiry-fields';
import { EnquiryThanks } from './enquiry-thanks';
import { useEnquiryForm } from './use-enquiry-form';

import { routes } from '@/config/site';

const card =
  'gap-[56px] p-space-6 tablet:p-space-8 inset-x-0! bottom-0! max-h-[calc(100svh-56px)] overflow-y-auto rounded-t-[24px] rounded-b-none tablet:w-[560px] tablet:rounded-[24px] tablet:max-h-[calc(100svh-48px)] shadow-[0_16px_48px_0_color-mix(in_srgb,var(--vows-color-ink-900)_12%,transparent)] tablet:inset-x-auto! tablet:bottom-auto!';

function EnquiryFormBody(): ReactElement {
  const { form, failure, sent, submit, honeypot } = useEnquiryForm();
  const sending = form.formState.isSubmitting;
  if (sent) return <EnquiryThanks />;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-[56px]">
      <div className="flex items-center justify-between">
        <DialogTitle className="type-heading-3 tablet:type-heading-2 text-primary">
          Let’s talk.
        </DialogTitle>
        <DialogClose className="relative flex size-[18px] items-center justify-center after:absolute after:-inset-[13px]">
          <Image src="/icons/close.svg" alt="" width={18} height={18} />
          <span className="sr-only">Close the form</span>
        </DialogClose>
      </div>
      <DialogDescription className="sr-only">
        Tell us your name, how to reach you, and when and where the wedding is.
      </DialogDescription>
      {/* Dimmed and locked while it sends, so nobody edits it or sends twice. */}
      <fieldset disabled={sending} className="min-w-0 transition-opacity disabled:opacity-50">
        <EnquiryFieldList form={form} />
        {/* A person never sees this one, so it must come back empty. */}
        <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" {...honeypot} />
          </label>
        </div>
      </fieldset>
      {failure ? (
        <p role="alert" className="type-ui-caption text-status-error">
          {failure}
        </p>
      ) : null}
      <div className="gap-space-6 flex items-end justify-between">
        <p className="type-body-xs text-secondary max-w-[290px]">
          By sending this, you agree that we may keep your details to reply to you. See our{' '}
          <Link href={routes.privacy.href} className="underline">
            Privacy Policy
          </Link>
          .
        </p>
        <CtaButton type="submit" arrow={false} pending={sending}>
          {sending ? 'Sending…' : 'Send'}
        </CtaButton>
      </div>
    </form>
  );
}

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
        onOpenAutoFocus={(event) => {
          // The first question, not the close button.
          event.preventDefault();
          (event.currentTarget as HTMLElement)
            .querySelector<HTMLInputElement>('input[name="name"]')
            ?.focus();
        }}
      >
        <EnquiryFormBody />
      </DialogContent>
    </Dialog>
  );
}

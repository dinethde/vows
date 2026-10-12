'use client';

import { CtaButton, DialogClose, DialogDescription, DialogTitle } from '@vows/ui';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { EnquiryFieldList } from './enquiry-fields';
import { EnquiryThanks } from './enquiry-thanks';
import { useEnquiryForm } from './use-enquiry-form';

import { routes } from '@/config/site';

/**
 * The form itself. It is a file of its own so the page does not carry the form
 * library and the schema until someone presses "Let's talk".
 */
export function EnquiryFormBody(): ReactElement {
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

import { CtaButton, DialogClose, DialogDescription, DialogTitle } from '@vows/ui';
import type { ReactElement } from 'react';

import { site } from '@/config/site';

/** Replaces the form, so there is nothing left to send twice. Read out when it appears. */
export function EnquiryThanks(): ReactElement {
  return (
    <div className="gap-space-8 flex flex-col" role="status" aria-live="polite">
      <DialogTitle className="type-heading-3 tablet:type-heading-2 text-primary">
        Thank you.
      </DialogTitle>
      <div className="gap-space-4 flex flex-col">
        <p className="type-heading-5 text-status-success flex items-center gap-[10px]">
          <span
            aria-hidden="true"
            className="bg-status-success rounded-pill flex size-[24px] items-center justify-center"
          >
            ✓
          </span>
          <span className="text-primary">Your message is on its way.</span>
        </p>
        <DialogDescription className="type-body-m text-secondary">
          We read every message ourselves, so a reply usually takes a day or two. If your date is
          close, call us on {site.phone} instead of waiting.
        </DialogDescription>
      </div>
      <div className="flex justify-end">
        <DialogClose asChild>
          <CtaButton arrow={false}>Close</CtaButton>
        </DialogClose>
      </div>
    </div>
  );
}

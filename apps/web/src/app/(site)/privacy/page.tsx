import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { CLOSING, INTRO, LAST_UPDATED, SECTIONS } from './content';

import { EmailLink } from '@/components/site/email-link';
import { SiteFooter } from '@/components/site/footer/site-footer';
import { site } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What Vows Weddings collects through the contact form, why, and for how long.',
  alternates: { canonical: '/privacy' },
};

const heading = 'type-heading-6 tablet:type-heading-5 text-heading';
const text = 'type-body-s tablet:type-body-m text-secondary';
const [user = '', domain = ''] = site.email.split('@');

/** One column, seven short sections, no legal language. The copy lives in the repository. */
export default function PrivacyPage(): ReactElement {
  return (
    <>
      <main
        id="main"
        className="bg-page px-space-6 pb-space-12 tablet:pt-[152px] relative z-10 flex justify-center pt-[112px]"
      >
        <article className="tablet:gap-[42px] flex w-full max-w-[720px] flex-col gap-[34px]">
          <header className="gap-space-2 tablet:gap-[10px] flex flex-col">
            <p className="type-body-xs text-muted tracking-[1.4px]">VOWS · LEGAL</p>
            <h1 className="type-heading-3 tablet:type-display-hero-s text-heading">Privacy</h1>
            <p className="type-body-xs text-muted">Last updated {LAST_UPDATED}</p>
            <p className={text}>{INTRO}</p>
          </header>
          {SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="gap-space-2 tablet:gap-[10px] flex scroll-mt-[72px] flex-col"
            >
              <h2 className={heading}>{section.heading}</h2>
              <p className={text}>{section.body}</p>
            </section>
          ))}
          <section
            id="getting-in-touch"
            className="gap-space-2 tablet:gap-[10px] flex scroll-mt-[72px] flex-col"
          >
            <h2 className={heading}>Getting in touch</h2>
            <p className={text}>
              <EmailLink user={user} domain={domain} className="underline" /> — for anything on this
              page, or to ask what we hold about you.
            </p>
          </section>
          <p className="type-body-xs text-muted">{CLOSING}</p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

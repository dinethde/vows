import { Chip } from '@vows/ui';
import type { Metadata } from 'next';
import Image from 'next/image';
import type { ReactElement, ReactNode } from 'react';

import { EnquiryDialog } from '@/components/site/contact/enquiry-dialog';
import { EmailLink } from '@/components/site/email-link';
import { SiteFooter } from '@/components/site/footer/site-footer';
import { site } from '@/config/site';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'We photograph a small number of weddings each year, so dates go early. Tell us when and where, and we will write back within two days.',
  alternates: { canonical: '/contact' },
};

const [user = '', domain = ''] = site.email.split('@');
const value = 'type-body-m text-secondary';

interface GroupProps {
  title: string;
  className: string;
  children: ReactNode;
}

function Group({ title, className, children }: GroupProps): ReactElement {
  return (
    <div className={`gap-space-5 flex flex-col items-start ${className}`}>
      <h2 className="type-ui-label text-accent">{title}</h2>
      {children}
    </div>
  );
}

/** The four groups along the bottom: one row on a desktop, stacked on a phone. */
function ContactDetails(): ReactElement {
  return (
    <div className="gap-y-space-5 tablet:grid-cols-[230px_240px_250px] tablet:justify-between tablet:gap-y-space-9 desktop:flex desktop:justify-between grid w-full grid-cols-1">
      <div className="gap-space-5 tablet:col-span-3 desktop:w-[320px] flex flex-col items-start">
        <Image src="/icons/arrow-40.svg" alt="" width={40} height={14} />
        <p className={value}>
          We photograph a small number of weddings each year, so dates go early. Tell us when and
          where, and we will write back within two days.
        </p>
      </div>
      <Group title="Social" className="desktop:w-[300px]">
        <ul className="gap-space-2 flex flex-wrap">
          {site.socials.map((social) => (
            <li key={social.label}>
              <Chip asChild>
                <a href={social.href} rel="noreferrer">
                  {social.label}
                </a>
              </Chip>
            </li>
          ))}
        </ul>
      </Group>
      <Group title="Contact" className="desktop:w-[250px]">
        <ul className="flex flex-col gap-[6px]">
          <li>
            <EmailLink user={user} domain={domain} className={value} />
          </li>
          <li>
            <a href={`tel:${site.phone.replaceAll(' ', '')}`} className={value}>
              {site.phone}
            </a>
          </li>
        </ul>
      </Group>
      <Group title="Studio" className="desktop:w-[230px]">
        <a
          href={site.mapUrl}
          rel="noreferrer"
          className={`${value} flex items-center gap-[10px] whitespace-nowrap`}
        >
          <Image src="/icons/location-pin.svg" alt="" width={18} height={18} />
          {site.place}
        </a>
      </Group>
    </div>
  );
}

/**
 * One screen, one ask. The top part and the details are pushed apart, and only
 * the gap between them flexes. Below about 620 of height the panel stops
 * forcing one screen and scrolls, because nothing may ever be cut off.
 */
export default function ContactPage(): ReactElement {
  return (
    <>
      <main
        id="main"
        className="bg-page px-space-5 tablet:px-space-8 desktop:px-space-10 gap-space-6 tablet:gap-space-10 tablet:pb-[72px] desktop:pb-[100px] tablet:pt-[128px] desktop:pt-[148px] relative z-10 flex min-h-svh flex-col items-center justify-between pb-[36px] pt-[96px] [@media(max-height:620px)]:min-h-0"
      >
        <div className="tablet:gap-space-8 gap-space-7 flex flex-col items-center">
          <p className="type-ui-caption text-secondary px-space-4 py-[6px]">
            <span className="underline underline-offset-2">Say hello</span>
          </p>
          <h1 className="type-display-hero-s tablet:type-display-hero-m desktop:type-display-hero-l text-primary flex flex-col items-center text-center">
            {/* The arrow and the first line are centred together, as one line. */}
            <span className="tablet:gap-[22px] desktop:gap-[28px] gap-space-3 flex items-center whitespace-nowrap">
              <Image
                src="/icons/arrow-56.svg"
                alt=""
                width={56}
                height={14}
                className="tablet:w-[40px] desktop:w-[56px] w-[30px] shrink-0"
              />
              Let’s talk about
            </span>
            <span>your day.</span>
          </h1>
          <EnquiryDialog />
        </div>
        <ContactDetails />
      </main>
      <SiteFooter />
    </>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';

import { EmailLink } from '@/components/site/email-link';
import { routes, site } from '@/config/site';

const label =
  'type-ui-label text-accent transition-colors duration-500 ease-out group-data-[revealed=true]/footer:text-on-accent';
const link = 'type-nav-link';

interface ColumnProps {
  /** A fixed width where Figma gives the column one; otherwise it hugs. */
  className?: string;
  title: string;
  children: ReactNode;
}

function Column({ title, children, className = '' }: ColumnProps): ReactElement {
  return (
    <div className={`gap-space-5 flex flex-col items-start ${className}`}>
      <h3 className={label}>{title}</h3>
      {children}
    </div>
  );
}

const [user = '', domain = ''] = site.email.split('@');

/** Menu, Socials, Contacts, Studio. One row from the tablet up, two rows of two on a phone. */
export function FooterColumns(): ReactElement {
  return (
    <nav
      aria-label="Footer"
      className="tablet:flex tablet:justify-between relative z-10 grid w-full grid-cols-[auto_auto] justify-between gap-y-[28px] [&>*:nth-child(even)]:justify-self-end"
    >
      <Column title="Menu">
        <ul className="gap-space-3 flex flex-col">
          <li>
            <Link href={routes.contact.href} className={link}>
              Contact
            </Link>
          </li>
          <li>
            <Link href={routes.chat.href} className={link}>
              Chat
            </Link>
          </li>
        </ul>
      </Column>
      <Column title="Socials">
        <ul className="gap-space-3 flex flex-col">
          {site.socials.map((social) => (
            <li key={social.label}>
              <a href={social.href} rel="noreferrer" className={link}>
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </Column>
      {/* Figma fixes this one at 193 from a tablet up; the other three hug. */}
      <Column title="Contacts" className="tablet:w-[193px]">
        <ul className="gap-space-2 flex flex-col">
          <li>
            <EmailLink user={user} domain={domain} className={link} />
          </li>
          <li>
            <a href={`tel:${site.phone.replaceAll(' ', '')}`} className={link}>
              {site.phone}
            </a>
          </li>
        </ul>
      </Column>
      <Column title="Studio">
        <a href={site.mapUrl} rel="noreferrer" className={`${link} flex items-center gap-[10px]`}>
          <Image src="/icons/location-pin.svg" alt="" width={18} height={18} />
          {site.placeShort}
        </a>
      </Column>
    </nav>
  );
}

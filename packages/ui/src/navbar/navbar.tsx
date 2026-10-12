import type { ReactElement } from 'react';

import { Button } from '../button';
import { navBackdrop } from '../lib/bar';
import { cn } from '../lib/cn';
import { focusRing } from '../lib/focus';

import type { NavbarProps } from './navbar.types';

/* 56 tall at every width. Side padding 16 / 24 / 64, as the component and the
 * components board both draw it. The breakpoint is CSS, never a prop. */
const bar = cn(
  'relative isolate flex h-[56px] w-full items-center justify-between',
  'px-space-4 tablet:px-space-6 desktop:px-space-10',
);

/* Drawn 24 and 32 tall; `before` takes each touch target to 44. */
const wordmark = cn(
  'relative type-nav-wordmark text-primary',
  'before:absolute before:-inset-x-space-2 before:-inset-y-[10px]',
  focusRing,
);
const textLink = cn(
  'relative flex h-space-7 min-w-[76px] items-center justify-center px-space-2 type-nav-link text-primary',
  'before:absolute before:inset-x-0 before:-inset-y-[6px]',
  focusRing,
);

export function Navbar({
  home,
  contact,
  cta,
  player,
  minimal = false,
  linkComponent: Link = 'a',
  className,
}: NavbarProps): ReactElement {
  const full = !minimal;

  return (
    <header className={cn(bar, className)}>
      <span aria-hidden="true" className={navBackdrop} />
      <Link href={home.href} className={wordmark}>
        {home.label}
      </Link>
      {full && player !== undefined ? (
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2">
          {player}
        </div>
      ) : null}
      {full && (contact !== undefined || cta !== undefined) ? (
        <nav className="gap-space-4 relative flex items-center">
          {contact !== undefined ? (
            <Link href={contact.href} className={textLink}>
              {contact.label}
            </Link>
          ) : null}
          {cta !== undefined ? (
            <Button variant="nav" asChild className="tablet:inline-flex hidden">
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}

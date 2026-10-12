'use client';

import { useUser } from '@clerk/nextjs';
import type { ReactElement } from 'react';

import { AccountMenu } from './account-menu';

/**
 * The bar across the top of every Studio screen. The name and the email are
 * the signed-in person's own, read from Clerk; until Clerk has answered the
 * greeting has no name rather than a wrong one.
 */
export function TopBar(): ReactElement {
  const { user } = useUser();
  const name = user?.fullName ?? user?.firstName ?? '';
  const first = user?.firstName ?? name.split(' ')[0] ?? '';
  const email = user?.primaryEmailAddress?.emailAddress ?? '';

  return (
    <header className="border-hairline bg-surface gap-space-4 px-space-4 py-space-3 tablet:px-space-5 flex items-center justify-between border-b">
      <p className="type-ui-field-m text-action-neutral font-medium">
        {first ? `Welcome back, ${first}` : 'Welcome back'}
      </p>
      <AccountMenu name={name} email={email} />
    </header>
  );
}

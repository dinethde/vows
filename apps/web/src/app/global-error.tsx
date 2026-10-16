'use client';

import { Navbar } from '@vows/ui';
import type { ReactElement } from 'react';

import { fontVariables } from './fonts';

import { ServerErrorScreen } from '@/components/site/error-pages';
import { routes } from '@/config/site';

import '@/styles/globals.css';

/** The root layout itself failed, so this draws its own document. */
export default function GlobalError(): ReactElement {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <title>500 · Vows</title>
        <header className="fixed inset-x-0 top-0 z-40">
          <Navbar home={routes.home} minimal />
        </header>
        <main id="main" className="flex min-h-svh flex-col justify-center pt-[56px]">
          <ServerErrorScreen
            action={{
              label: 'Reload the page',
              onClick: () => {
                window.location.reload();
              },
            }}
          />
        </main>
      </body>
    </html>
  );
}

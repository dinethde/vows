"use client";

import { useState } from "react";
import type { ReactElement } from "react";

import { Navbar } from "@vows/ui";
import { ServerErrorScreen } from "@/components/site/error-pages";
import { routes } from "@/config/site";

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * A failure inside a route. The bar is the wordmark alone: the player and the
 * links may be what broke. A second failure offers a full reload instead.
 */
export default function ErrorPage({ reset }: ErrorPageProps): ReactElement {
  const [tried, setTried] = useState(false);
  const action = tried
    ? {
        label: "Reload the page",
        onClick: () => {
          window.location.reload();
        },
      }
    : {
        label: "Try again",
        onClick: () => {
          setTried(true);
          reset();
        },
      };
  return (
    <>
      <title>500 · Vows</title>
      <header className="fixed inset-x-0 top-0 z-40">
        <Navbar home={routes.home} minimal />
      </header>
      <main id="main" className="flex min-h-svh flex-col justify-center pt-[56px]">
        <ServerErrorScreen action={action} />
      </main>
    </>
  );
}

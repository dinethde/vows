"use client";

import Link from "next/link";

import type { ReactElement } from "react";

import { Banner, Button } from "@vows/ui";

export interface StudioErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * A Studio page could not be loaded: the API is down, or it answered with
 * something this page cannot read. The top bar stays, the photographer is told
 * plainly, and the two ways out are trying again and going back to the albums.
 */
export default function StudioError({ error, reset }: StudioErrorProps): ReactElement {
  return (
    <div className="gap-space-5 px-space-5 py-space-8 tablet:px-space-7 flex w-full max-w-[640px] flex-col items-start self-center">
      <h1 className="type-studio-heading text-heading">This page could not be loaded.</h1>
      <Banner state="Error">
        The Studio could not reach its server. Nothing you saved has been lost. Try again in a
        moment.
      </Banner>
      {error.digest ? (
        <p className="type-studio-caption text-placeholder">Reference: {error.digest}</p>
      ) : null}
      <div className="gap-space-3 flex">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/studio">All albums</Link>
        </Button>
      </div>
    </div>
  );
}

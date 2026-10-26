import type { Metadata } from "next";

import type { ReactElement } from "react";

import { NotFoundScreen } from "@/components/site/error-pages";
import { MusicProvider } from "@/components/site/music/music-provider";
import { SiteNavbar } from "@/components/site/site-navbar";

export const metadata: Metadata = { title: "404", robots: { index: false } };

/** Served with a real 404. The normal bar, so a song that is playing keeps playing. */
export default function NotFound(): ReactElement {
  return (
    <MusicProvider>
      <header className="fixed inset-x-0 top-0 z-40">
        <SiteNavbar />
      </header>
      <main id="main" className="flex min-h-svh flex-col justify-center pt-[56px]">
        <NotFoundScreen />
      </main>
    </MusicProvider>
  );
}

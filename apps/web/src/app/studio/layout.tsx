import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { headers } from "next/headers";

import type { ReactElement, ReactNode } from "react";

import { StudioProviders } from "@/components/studio/shell/studio-providers";
import { TopBar } from "@/components/studio/shell/top-bar";
import { GATE_HEADER, SIGN_IN_PATH, STUDIO_HOME } from "@/lib/auth/constants";

export const metadata: Metadata = {
  title: { default: "Studio", template: "%s · Vows Studio" },
  robots: { index: false, follow: false },
};

/** Never built ahead of time, never cached: every Studio page belongs to one person. */
export const dynamic = "force-dynamic";

export interface StudioLayoutProps {
  children: ReactNode;
}

/**
 * The signed-in half of the site. The middleware has already decided whether
 * this visitor gets in and says so in a header. When they do, the shell is
 * drawn in the Studio's token mode with its providers. When they do not, the
 * child is the sign-in screen or the 403 screen, which stand on their own.
 */
export default async function StudioLayout({ children }: StudioLayoutProps): Promise<ReactElement> {
  const open = (await headers()).get(GATE_HEADER) === "open";

  return (
    <ClerkProvider
      signInUrl={SIGN_IN_PATH}
      signInFallbackRedirectUrl={STUDIO_HOME}
      afterSignOutUrl={SIGN_IN_PATH}
    >
      {open ? (
        <div
          data-surface="studio"
          className="bg-page text-primary type-studio-body flex min-h-svh flex-col"
        >
          <StudioProviders>
            <TopBar />
            <main id="main" className="flex flex-1 flex-col">
              {children}
            </main>
          </StudioProviders>
        </div>
      ) : (
        children
      )}
    </ClerkProvider>
  );
}

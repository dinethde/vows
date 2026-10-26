"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createContext, useContext, useState } from "react";
import type { ReactElement, ReactNode } from "react";

import { ApiProvider } from "./api-context";
import { UploadProvider } from "./upload-context";

const PortalContext = createContext<HTMLElement | null>(null);

const HALF_A_MINUTE = 30_000;

export interface StudioProvidersProps {
  children: ReactNode;
}

function newQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: HALF_A_MINUTE, retry: 1, refetchOnWindowFocus: false },
    },
  });
}

/**
 * Everything the Studio's client components share: the query cache, the API
 * client and the upload queue. TanStack Query is mounted here and nowhere
 * else, so the public pages never ship it. The last element is where modals
 * are portalled to: inside the Studio's `data-surface`, so their tokens
 * resolve to the Studio's values.
 */
export function StudioProviders({ children }: StudioProvidersProps): ReactElement {
  const [queryClient] = useState(newQueryClient);
  const [portal, setPortal] = useState<HTMLElement | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider>
        <UploadProvider>
          <PortalContext.Provider value={portal}>{children}</PortalContext.Provider>
        </UploadProvider>
      </ApiProvider>
      <div ref={setPortal} />
    </QueryClientProvider>
  );
}

/** Pass this to `ConfirmationModal` as `container`. */
export function usePortalContainer(): HTMLElement | null {
  return useContext(PortalContext);
}

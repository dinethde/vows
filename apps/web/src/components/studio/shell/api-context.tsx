"use client";

import { useAuth } from "@clerk/nextjs";

import { createContext, useContext, useMemo } from "react";
import type { ReactElement, ReactNode } from "react";

import { authedApi } from "@/lib/api";
import type { ApiClient } from "@/lib/api";

const ApiContext = createContext<ApiClient | null>(null);

export interface ApiProviderProps {
  children: ReactNode;
}

/**
 * The API client for client components. It is the same client the server uses;
 * only the place the token comes from differs. The client is kept between
 * renders so a query's function does not change under it.
 */
export function ApiProvider({ children }: ApiProviderProps): ReactElement {
  const { getToken } = useAuth();
  const api = useMemo(() => authedApi(() => getToken()), [getToken]);
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiClient {
  const api = useContext(ApiContext);
  if (!api) throw new Error("useApi must be used inside the Studio layout.");
  return api;
}

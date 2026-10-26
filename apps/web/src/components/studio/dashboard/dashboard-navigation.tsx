"use client";

import { useRouter } from "next/navigation";

import { createContext, useContext, useTransition } from "react";
import type { ReactElement } from "react";

import type { DashboardNavigationProps } from "./dashboard-navigation.types";

export interface DashboardNavigation {
  /** A search, a filter or a refresh is on its way. Only the grid shows it. */
  pending: boolean;
  /** Shows another view of the dashboard. `replace` keeps typing out of the history. */
  show: (href: string, history: "push" | "replace") => void;
  /** Reads the dashboard again, after an album has changed. */
  refresh: () => void;
}

const DashboardNavigationContext = createContext<DashboardNavigation | null>(null);

/**
 * One transition for everything that changes what the grid lists. While it
 * runs Next keeps the page on screen instead of handing the route to
 * `loading.tsx`, and the grid reads `pending` to say it is busy.
 */
export function DashboardNavigationProvider({ children }: DashboardNavigationProps): ReactElement {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const value: DashboardNavigation = {
    pending,
    show: (href, history) => {
      startTransition(() => {
        router[history](href, { scroll: false });
      });
    },
    refresh: () => {
      startTransition(() => {
        router.refresh();
      });
    },
  };

  return (
    <DashboardNavigationContext.Provider value={value}>
      {children}
    </DashboardNavigationContext.Provider>
  );
}

export function useDashboardNavigation(): DashboardNavigation {
  const value = useContext(DashboardNavigationContext);
  if (!value) throw new Error("useDashboardNavigation must be used inside the dashboard.");
  return value;
}

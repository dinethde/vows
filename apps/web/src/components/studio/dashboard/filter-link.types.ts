import type { ReactNode } from 'react';

export interface FilterLinkProps {
  href: string;
  current: boolean;
  className: string;
  children: ReactNode;
}

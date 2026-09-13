import type * as React from "react";

import { Button } from "~/components/ui/button";
import { copy } from "~/data/copy";
import { cn } from "~/lib/utils";

/**
 * "Chat with Dinuka" — in the navbar on desktop and tablet, floating above the
 * bottom bar on mobile (DESIGN.md §3.7).
 */
export function ChatCta({
  className,
  ...props
}: React.ComponentProps<"a"> & { className?: string; inert?: boolean }) {
  return (
    <Button asChild variant="pill" className={cn(className)}>
      <a href={copy.cta.href} {...props}>
        {copy.cta.label}
      </a>
    </Button>
  );
}

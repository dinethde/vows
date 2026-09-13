import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

/**
 * shadcn/ui Button, scoped to the one variant this design uses: the
 * pill-shaped "Chat with Dinuka" call to action (DESIGN.md §3.7).
 * Every value below resolves to a token from src/styles/tokens.css.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-serif transition-[opacity,border-color,transform] ease-hover disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        pill: "bg-surface border border-border-subtle text-ink rounded-pill duration-[var(--duration-fast)] hover:border-ink",
        ghost: "text-ink duration-[var(--duration-fast)] hover:opacity-[var(--hover-link-opacity)]",
      },
      size: {
        default: "px-md py-[var(--spacing-2xs)] text-cta",
        link: "px-xs py-3xs text-body",
        wordmark: "px-xs py-3xs text-h5",
      },
    },
    defaultVariants: { variant: "pill", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";

import { cn } from "~/lib/utils";

/**
 * shadcn/ui Sheet, scoped to the single right-side mobile menu
 * (DESIGN.md §3.9). Radix gives focus trapping, Esc-to-close, scroll lock
 * and the aria wiring; the motion is the design's own (§5.2 #9).
 */
const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;
const SheetTitle = SheetPrimitive.Title;
const SheetDescription = SheetPrimitive.Description;

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-[var(--z-overlay)] bg-backdrop",
        "data-[state=open]:animate-[vows-fade-in_var(--duration-sheet)_var(--ease-inout)_both]",
        "data-[state=closed]:animate-[vows-fade-out_var(--duration-sheet)_var(--ease-inout)_both]",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content>) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed inset-y-0 right-0 z-[var(--z-overlay)] flex h-full w-[var(--sheet-w)] flex-col",
          "bg-scrim backdrop-blur-[var(--blur-sheet)]",
          "data-[state=open]:animate-[vows-sheet-in_var(--duration-sheet)_var(--ease-inout)_both]",
          "data-[state=closed]:animate-[vows-sheet-out_var(--duration-sheet)_var(--ease-inout)_both]",
          "motion-reduce:data-[state=open]:animate-[vows-fade-in_var(--duration-base)_var(--ease-inout)_both]",
          "motion-reduce:data-[state=closed]:animate-[vows-fade-out_var(--duration-base)_var(--ease-inout)_both]",
          className,
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetTitle,
  SheetDescription,
};

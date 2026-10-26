import type * as DialogPrimitive from "@radix-ui/react-dialog";

import type { ComponentProps } from "react";

export type DialogProps = ComponentProps<typeof DialogPrimitive.Root>;
export type DialogTriggerProps = ComponentProps<typeof DialogPrimitive.Trigger>;
export type DialogPortalProps = ComponentProps<typeof DialogPrimitive.Portal>;
export type DialogCloseProps = ComponentProps<typeof DialogPrimitive.Close>;
export type DialogOverlayProps = ComponentProps<typeof DialogPrimitive.Overlay>;
export type DialogTitleProps = ComponentProps<typeof DialogPrimitive.Title>;
export type DialogDescriptionProps = ComponentProps<typeof DialogPrimitive.Description>;

export interface DialogContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  /** Where the dialog is portalled to. Tokens resolve from the nearest
   * `data-surface`, so a Studio dialog has to land inside the Studio's. */
  container?: DialogPortalProps["container"];
  /** Classes for the scrim. The contact form dims the page less than a
   * Studio confirmation does. */
  overlayClassName?: string;
}

export type DialogHeaderProps = ComponentProps<"div">;
export type DialogFooterProps = ComponentProps<"div">;

"use client";

import type { ReactElement } from "react";

import { Button } from "../button";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/focus";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../primitives/dialog";
import { CloseGlyph, InfoGlyph, WarningGlyph } from "./confirmation-modal-glyphs";
import type { ConfirmationModalProps } from "./confirmation-modal.types";
import { useModalFocus } from "./use-modal-focus";

/* 14 as drawn; `before` takes the touch target to 44. */
const close = cn(
  "relative flex size-[14px] shrink-0 cursor-pointer items-center justify-center text-muted",
  "before:absolute before:-inset-[15px]",
  focusRing,
);

export function ConfirmationModal({
  open,
  tone = "primary",
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  pending = false,
  error,
  container,
}: ConfirmationModalProps): ReactElement {
  const focus = useModalFocus();
  const danger = tone === "danger";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent
        container={container}
        role={danger ? "alertdialog" : "dialog"}
        className="px-space-5 pt-space-5 gap-[14px] pb-[18px]"
        onOpenAutoFocus={focus.onOpenAutoFocus}
        onCloseAutoFocus={focus.onCloseAutoFocus}
      >
        <DialogHeader>
          <DialogTitle className="min-w-0 flex-1">{title}</DialogTitle>
          <DialogClose className={close} aria-label="Close">
            <CloseGlyph />
          </DialogClose>
        </DialogHeader>
        <div className="flex items-start gap-[10px]">
          {danger ? <WarningGlyph /> : <InfoGlyph />}
          <DialogDescription className="min-w-0 flex-1">{message}</DialogDescription>
        </div>
        {error !== undefined && error !== "" ? (
          <p role="alert" className="type-studio-body text-status-error">
            {error}
          </p>
        ) : null}
        <DialogFooter className="pt-space-1">
          <Button ref={focus.cancel} variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={danger ? "danger" : "primary"} pending={pending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import type { ReactNode } from "react";

/** `danger` is for the uses that take something away: the confirm button turns
 * red, the icon becomes the warning triangle and the role is `alertdialog`. */
export type ConfirmationModalTone = "primary" | "danger";

export interface ConfirmationModalProps {
  open: boolean;
  /** Defaults to `primary`. */
  tone?: ConfirmationModalTone;
  /** A plain question: "Publish this album?" */
  title: string;
  /** What will actually happen, how long it takes and what can be recovered. */
  message: ReactNode;
  /** Repeats the verb: "Delete photograph", never "OK". */
  confirmLabel: string;
  onConfirm: () => void;
  /** Cancel, the ×, the scrim and Escape all end up here. */
  onCancel: () => void;
  /** The request is in flight. The modal stays open until the caller closes it. */
  pending?: boolean;
  /** The message from the error envelope when the request failed. The modal
   * stays open and shows it. */
  error?: string;
  /** Where the modal is portalled to. Pass the element that carries
   * `data-surface="studio"` unless that attribute is on `body` or above. */
  container?: HTMLElement | null;
}

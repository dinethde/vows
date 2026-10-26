import { type RefObject, useRef } from "react";

interface ModalFocus {
  /** Goes on the Cancel button. */
  cancel: RefObject<HTMLButtonElement | null>;
  onOpenAutoFocus: (event: Event) => void;
  onCloseAutoFocus: (event: Event) => void;
}

/** Where the focus goes when the modal opens and closes. It lands on Cancel,
 * because nobody should delete a photograph with a stray Enter. Radix hands
 * the focus back to its own trigger on close; this modal is opened by a prop
 * and has none, so it remembers who had the focus and returns it. */
export function useModalFocus(): ModalFocus {
  const cancel = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);

  return {
    cancel,
    onOpenAutoFocus: (event) => {
      event.preventDefault();
      opener.current = document.activeElement;
      cancel.current?.focus();
    },
    onCloseAutoFocus: (event) => {
      event.preventDefault();
      if (opener.current instanceof HTMLElement) opener.current.focus();
    },
  };
}

"use client";

import { ConfirmationModal } from "@vows/ui";

import type { ReactElement } from "react";

import { CONFIRMATIONS } from "@/components/studio/confirmations";
import { usePortalContainer } from "@/components/studio/shell/studio-providers";

import { useEditor } from "./editor-context";

/**
 * The editor's confirmations: publishing, moving back to draft, discarding
 * edits, and deleting a photograph. Each stays open while its request is in
 * flight, and shows the API's own sentence if the request is refused.
 * Deleting from a live album is refused; the modal says so and why.
 */
export function EditorModals(): ReactElement {
  const { actions, mutations } = useEditor();
  const container = usePortalContainer();
  const { removal } = mutations;
  const copy = CONFIRMATIONS[actions.modal ?? "publish"];

  return (
    <>
      <ConfirmationModal
        {...copy}
        open={actions.modal !== null}
        pending={actions.pending}
        {...(actions.modalError ? { error: actions.modalError } : {})}
        container={container}
        onConfirm={actions.confirm}
        onCancel={actions.closeModal}
      />
      <ConfirmationModal
        {...CONFIRMATIONS.deletePhoto}
        open={removal.photo !== null}
        pending={removal.pending}
        {...(removal.error ? { error: removal.error } : {})}
        container={container}
        onConfirm={removal.confirm}
        onCancel={removal.cancel}
      />
    </>
  );
}

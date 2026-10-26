import { useState, useTransition } from "react";

import type { ConfirmationKind } from "@/components/studio/confirmations";

import { firstProblem, focusProblem } from "./editor-problems";
import type { AlbumForm } from "./editor-problems";
import type { Problems } from "./publish-problems";
import { useEditorRequests } from "./use-editor-requests";
import type { EditorRequests, EditorRequestsInput } from "./use-editor-requests";

export type EditorModal = Exclude<ConfirmationKind, "deletePhoto">;

/** The two buttons that do their work without a confirmation in front of them. */
export type EditorButton = 'publish' | 'draft';

export interface EditorActionsInput extends EditorRequestsInput {
  /** Everything the browser can already see is stopping the album going out. */
  problems: Problems;
}

export interface EditorActions {
  modal: EditorModal | null;
  modalError: string | undefined;
  pending: boolean;
  /** The button whose work is running while no confirmation is open, so it alone spins. */
  busy: EditorButton | null;
  pressPublish: () => void;
  pressDraft: () => void;
  /** Cancel, and the "All albums" link: both leave, and both ask first if there are edits. */
  pressLeave: () => void;
  confirm: () => void;
  closeModal: () => void;
}

/** The client check. False, with focus on the first bad field, when it fails. */
async function fieldsValid(form: AlbumForm): Promise<boolean> {
  if (await form.trigger()) return true;
  const first = firstProblem(form, {});
  if (first) focusProblem(form, first);
  return false;
}

/**
 * What agreeing to each confirmation does. Each answers with the sentence to
 * keep the modal open on, or null to close it.
 */
function agreed(requests: EditorRequests): Record<EditorModal, () => Promise<string | null>> {
  return {
    discard: () => {
      requests.leave();
      return Promise.resolve(null);
    },
    publish: () => requests.publish().then(() => null),
    moveToDraft: requests.moveToDraft,
  };
}

/**
 * What the three buttons do, and what each confirmation does when agreed to.
 * Publish and move-to-draft ask first. Saving a draft does not: it can be
 * undone by editing again.
 */
export function useEditorActions(input: EditorActionsInput): EditorActions {
  const { album, form, problems } = input;
  const requests = useEditorRequests(input);
  const [modal, setModal] = useState<EditorModal | null>(null);
  const [modalError, setModalError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [pressed, setPressed] = useState<EditorButton | null>(null);
  const { isDirty } = form.formState;

  const open = (kind: EditorModal): void => {
    setModalError(undefined);
    setModal(kind);
  };
  const run = (button: EditorButton | null, work: () => Promise<void>): void => {
    input.onFailure(null);
    setPressed(button);
    startTransition(work);
  };
  const confirm = (kind: EditorModal): void => {
    run(null, async () => {
      const refusal = await agreed(requests)[kind]();
      if (refusal === null) setModal(null);
      else setModalError(refusal);
    });
  };

  return {
    modal,
    modalError,
    pending,
    busy: pending && modal === null ? pressed : null,
    closeModal: () => {
      setModal(null);
    },
    pressPublish: () => {
      run('publish', async () => {
        input.onReveal({});
        if (!(await fieldsValid(form))) return;
        const first = firstProblem(form, problems);
        if (first) focusProblem(form, first);
        else open("publish");
      });
    },
    pressDraft: () => {
      run('draft', async () => {
        if (!(await fieldsValid(form))) return;
        if (album.stage === "published") open("moveToDraft");
        else await requests.saveDraft();
      });
    },
    pressLeave: () => {
      if (isDirty) open("discard");
      else requests.leave();
    },
    confirm: () => {
      if (modal) confirm(modal);
    },
  };
}

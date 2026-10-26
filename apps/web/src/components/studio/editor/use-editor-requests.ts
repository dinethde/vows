import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import type { StudioAlbum, UpdateAlbum } from "@vows/contracts";
import { publishAlbum, saveAlbum, unpublishAlbum } from "@/app/studio/actions";
import type { ActionFailure } from "@/components/studio/action-result";
import { studioKeys } from "@/components/studio/query-keys";
import { STUDIO_HOME } from "@/lib/auth/constants";

import { toChanges, toFormValues } from "./album-form.schema";
import { applyFieldErrors, focusProblem } from "./editor-problems";
import type { AlbumForm } from "./editor-problems";
import type { Problems } from "./publish-problems";

export interface EditorRequestsInput {
  album: StudioAlbum;
  form: AlbumForm;
  onAlbum: (album: StudioAlbum) => void;
  /** Turns the red marks on, with the API's own list when it sent one. */
  onReveal: (fromServer: Problems) => void;
  onPublished: () => void;
  /** A failure that belongs to no field: shown in the banner. */
  onFailure: (message: string | null) => void;
}

export interface EditorRequests {
  /** Back to the dashboard, which is read again so its counts are current. */
  leave: () => void;
  /** Each resolves true when it went through. A refusal is already on screen. */
  publish: () => Promise<boolean>;
  saveDraft: () => Promise<boolean>;
  /** Resolves with the API's sentence if the album could not be taken down. */
  moveToDraft: () => Promise<string | null>;
}

const MODAL_CLOSE_MS = 60;

/**
 * A refusal usually arrives while a confirmation is open. The modal hands the
 * focus back to the button that opened it as it closes, so the move to the
 * thing that needs fixing has to come just after that, or it is undone.
 */
function afterModal(work: () => void): void {
  window.setTimeout(work, MODAL_CLOSE_MS);
}

/** The three requests the editor makes, and where each refusal is shown. */
export function useEditorRequests(input: EditorRequestsInput): EditorRequests {
  const { album, form } = input;
  const router = useRouter();
  const queryClient = useQueryClient();
  // Read while rendering, which is how the form knows to keep it current.
  const { dirtyFields } = form.formState;
  const changes = (): UpdateAlbum | null => toChanges(form.getValues(), dirtyFields);

  const leave = (): void => {
    router.push(STUDIO_HOME);
    router.refresh();
  };

  /** A refusal goes beside its field or slot if it names one, and into the banner if not. */
  const refused = (failure: ActionFailure): false => {
    if (failure.code === "album_not_publishable") {
      input.onReveal(failure.fields);
      void queryClient.invalidateQueries({ queryKey: studioKeys.photos(album.id) });
      const first = Object.keys(failure.fields)[0];
      if (first)
        afterModal(() => {
          focusProblem(form, first);
        });
      return false;
    }
    const field = applyFieldErrors(form, failure);
    if (field)
      afterModal(() => {
        focusProblem(form, field);
      });
    else input.onFailure(failure.message);
    return false;
  };

  const saveDraft = async (): Promise<boolean> => {
    const edits = changes();
    const result = edits ? await saveAlbum(album.id, edits) : null;
    if (result && !result.ok) return refused(result);
    leave();
    return true;
  };

  return {
    leave,
    saveDraft,
    publish: async () => {
      const result = await publishAlbum(album.id, changes());
      if (!result.ok) return refused(result);
      input.onAlbum(result.data);
      form.reset(toFormValues(result.data));
      input.onPublished();
      return true;
    },
    moveToDraft: async () => {
      const result = await unpublishAlbum(album.id);
      if (!result.ok) return result.message;
      input.onAlbum(result.data);
      await saveDraft();
      return null;
    },
  };
}

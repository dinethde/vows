import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { useState } from "react";

import type { StudioAlbum } from "@vows/contracts";
import type { BannerState, StatusPillState } from "@vows/ui";
import { pillFor } from "@/components/studio/stage";

import { albumFormSchema, toFormValues } from "./album-form.schema";
import type { AlbumFieldName, AlbumFormValues } from "./album-form.schema";
import { countProblems } from "./editor-problems";
import type { AlbumForm } from "./editor-problems";
import { findProblems, problemSummary } from "./publish-problems";
import type { Problems } from "./publish-problems";
import { useAlbumPhotos } from "./use-album-photos";
import type { AlbumPhotos } from "./use-album-photos";
import { useEditorActions } from "./use-editor-actions";
import type { EditorActions } from "./use-editor-actions";
import { usePhotoMutations } from "./use-photo-mutations";
import type { PhotoMutations } from "./use-photo-mutations";
import { useUnsavedWarning } from "./use-unsaved-warning";

export interface EditorBanner {
  state: BannerState;
  text: string;
}

export interface AlbumEditorState {
  album: StudioAlbum;
  form: AlbumForm;
  photos: AlbumPhotos;
  mutations: PhotoMutations;
  actions: EditorActions;
  /** The problems to mark: empty until Publish has been pressed. */
  shown: Problems;
  /** How many things stop the album going out right now, pressed or not. */
  blockedBy: number;
  /** Publish has been pressed and refused, so the reasons are on screen. */
  revealed: boolean;
  banner: EditorBanner | null;
  pill: StatusPillState;
  /** Published in this visit, so the stamp says "just now". */
  justPublished: boolean;
  fieldError: (name: AlbumFieldName) => string | undefined;
}

const UNSAVED = "Unsaved changes — publish to put them on the website.";
const SAVED = "Saved. These changes are live on the album page.";

interface BannerInput {
  wrong: number;
  failure: string | null;
  dirty: boolean;
  saved: boolean;
}

/** One strip at a time, and the most urgent one wins. */
export function chooseBanner({ wrong, failure, dirty, saved }: BannerInput): EditorBanner | null {
  if (wrong > 0) return { state: "Error", text: problemSummary(wrong) };
  if (failure) return { state: "Error", text: failure };
  if (dirty) return { state: "Unsaved", text: UNSAVED };
  if (saved) return { state: "Saved", text: SAVED };
  return null;
}

/** An album with nothing in it stops being Untouched the moment something is added. */
function pillOf(album: StudioAlbum, touched: boolean): StatusPillState {
  return album.stage === "untouched" && touched ? "Draft" : pillFor(album.stage);
}

function useDetailsForm(album: StudioAlbum): AlbumForm {
  return useForm<AlbumFormValues>({
    resolver: zodResolver(albumFormSchema),
    defaultValues: toFormValues(album),
    // Checked when the person leaves a field, then on every change, so an
    // error clears the moment the field is right.
    mode: "onTouched",
  });
}

/** What the browser can already see is stopping the album, as it is typed and uploaded. */
function useLocalProblems(form: AlbumForm, photos: AlbumPhotos): Problems {
  const [coupleNames, shotOn] = useWatch({
    control: form.control,
    name: ["coupleNames", "shotOn"],
  });
  return findProblems({
    coupleNames,
    shotOn,
    photos: photos.photos,
    uploading: photos.uploading,
  });
}

/**
 * The editor's whole state in one place: the form, the photographs, what is
 * stopping the album being published, and which strip to show. The components
 * under it only draw.
 */
export function useAlbumEditor(initial: StudioAlbum): AlbumEditorState {
  const [album, setAlbum] = useState(initial);
  const [revealed, setRevealed] = useState(false);
  const [fromServer, setFromServer] = useState<Problems>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [justPublished, setJustPublished] = useState(false);

  const form = useDetailsForm(initial);
  const photos = useAlbumPhotos(album);
  const mutations = usePhotoMutations(album.id);
  const { isDirty, errors } = form.formState;
  useUnsavedWarning(isDirty);

  const local = useLocalProblems(form, photos);
  // What the browser can see wins. The API's list is only for what it cannot.
  const known = Object.keys(local).length > 0 ? local : fromServer;
  const shown = revealed ? known : {};

  const actions = useEditorActions({
    album,
    form,
    problems: local,
    onAlbum: setAlbum,
    onReveal: (server) => {
      setFromServer(server);
      setRevealed(true);
    },
    onPublished: () => {
      setRevealed(false);
      setFromServer({});
      setJustPublished(true);
    },
    onFailure: setFailure,
  });

  return {
    album,
    form,
    photos,
    mutations,
    actions,
    shown,
    revealed,
    blockedBy: countProblems(form, local),
    banner: chooseBanner({
      wrong: countProblems(form, shown),
      failure,
      dirty: isDirty,
      saved: justPublished,
    }),
    pill: pillOf(album, isDirty || photos.photos.length > 0),
    justPublished,
    fieldError: (name) => errors[name]?.message ?? shown[name],
  };
}

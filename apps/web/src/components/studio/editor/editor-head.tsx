"use client";

import { useWatch } from "react-hook-form";

import type { ReactElement } from "react";

import { Button, StatusPill, cn } from "@vows/ui";
import { focusRing } from "@/components/shared/focus";
import { env } from "@/config/env";

import { useEditor } from "./editor-context";

/**
 * The top of the edit-first layout, below the desktop width: the way back, the
 * album's name and where it has got to. The preview panel does not fit here,
 * so a live album gets a Preview link to its real page instead.
 */
export function EditorHead(): ReactElement {
  const { album, form, pill, actions } = useEditor();
  const names = useWatch({ control: form.control, name: "coupleNames" });
  const live = album.stage === "published";

  return (
    <div className="flex flex-col items-start gap-[6px]">
      <button
        type="button"
        className={cn(
          "type-studio-body-s text-placeholder relative cursor-pointer before:absolute before:-inset-x-2 before:-inset-y-[14px]",
          focusRing,
        )}
        onClick={actions.pressLeave}
      >
        <span aria-hidden="true">← </span>All albums
      </button>
      <div className="flex flex-wrap items-center gap-[10px]">
        <h1 className="type-studio-subheading tablet:type-studio-heading text-heading">
          {names.trim() === "" ? album.title : names.trim()}
        </h1>
        <StatusPill state={pill} />
        {live ? (
          <Button asChild variant="outline">
            <a
              href={`${env.SITE_URL.replace(/\/$/, "")}/albums/${album.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              Preview<span className="sr-only"> the album page in a new tab</span>
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

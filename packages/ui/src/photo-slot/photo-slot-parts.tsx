import type { ReactElement } from "react";

import { cn } from "../lib/cn";
import {
  CrossGlyph,
  PictureGlyph,
  ProgressRing,
  ReplaceGlyph,
  WarningGlyph,
} from "./photo-slot-glyphs";
import { percent, removeName } from "./photo-slot-name";
import type { PhotoSlotProps } from "./photo-slot.types";
import { hasPhoto } from "./use-photo-slot";

const stack = "flex flex-col items-center gap-[10px]";

/** What the box says: the glyph and the short word for the state. */
export function Face({ state, progress }: PhotoSlotProps): ReactElement | null {
  if (state === "Empty") {
    return (
      <span className={cn(stack, "text-muted")}>
        <PictureGlyph />
        Add photo
      </span>
    );
  }
  if (state === "Uploading") {
    return (
      <span className={cn(stack, "text-muted")}>
        <ProgressRing />
        {percent(progress)}
      </span>
    );
  }
  if (state === "Error") {
    return (
      <span className={cn(stack, "text-status-error")}>
        <WarningGlyph />
        Failed
      </span>
    );
  }
  return null;
}

const fill = "absolute inset-0 size-full object-cover";

/** The photograph, over its ThumbHash, or the picture glyph when the caller
 * has neither yet. It sits outside the button so its description is read. */
export function Photo({ state, src, alt, placeholderSrc }: PhotoSlotProps): ReactElement | null {
  if (!hasPhoto(state)) return null;
  if (src === undefined && placeholderSrc === undefined) {
    return (
      <span className="absolute inset-0 flex items-center justify-center">
        <PictureGlyph className={state === "Update" ? "opacity-50" : "opacity-80"} />
      </span>
    );
  }
  return (
    <>
      {placeholderSrc !== undefined ? (
        <img src={placeholderSrc} alt="" aria-hidden="true" className={fill} />
      ) : null}
      {src !== undefined ? <img src={src} alt={alt ?? ""} className={fill} /> : null}
    </>
  );
}

/* `bg/scrim` at 62 per cent. Only the scrim fades, over 120ms; the picture
 * does not move or scale. */
const overlay = cn(
  "absolute inset-0 flex flex-col items-center justify-center gap-[6px] bg-scrim/62 p-space-2",
  "text-inverse transition-opacity duration-[120ms] motion-reduce:transition-none",
);

/** Held open for `Update` and while a file is dragged over. On an Uploaded
 * slot it appears on hover and on keyboard focus. */
export function ReplaceOverlay({ shown }: { shown: boolean }): ReactElement {
  return (
    <span
      className={cn(
        overlay,
        shown
          ? "opacity-100"
          : "group-has-focus-visible:opacity-100 opacity-0 group-hover:opacity-100",
      )}
    >
      <ReplaceGlyph />
      Replace
    </span>
  );
}

const badgeClasses = cn(
  "pointer-events-none absolute top-[6px] left-[6px] flex h-[14px] items-center bg-surface",
  "px-space-1 type-studio-overline-s text-secondary",
);

/* 20 as drawn; `before` takes the touch target to 44. */
const cross = cn(
  "absolute top-[6px] right-[6px] flex size-space-5 cursor-pointer items-center justify-center",
  "rounded-pill border border-hairline bg-surface text-secondary outline-none",
  "before:absolute before:-inset-space-3",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
);

/** The position badge in the top left and the round cross in the top right. */
export function Corners(props: PhotoSlotProps): ReactElement {
  const { state, badge = false, number, onRemove } = props;

  return (
    <>
      {badge && number !== undefined ? (
        <span aria-hidden="true" className={badgeClasses}>
          {number}
        </span>
      ) : null}
      {hasPhoto(state) && onRemove !== undefined ? (
        <button type="button" className={cross} aria-label={removeName(props)} onClick={onRemove}>
          <CrossGlyph />
        </button>
      ) : null}
    </>
  );
}

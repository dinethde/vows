'use client';

import { COVER_POSITION, GALLERY_SIZE } from '@vows/contracts';
import { cn, PhotoSlot } from '@vows/ui';
import type { PhotoSlotProps } from '@vows/ui';
import { useId, useRef } from 'react';
import type { ReactElement } from 'react';

import { slotProblems } from './publish-problems';
import { SlotCaption } from './slot-caption';
import type { SlotBoxProps, SlotCardProps } from './slot-card.types';
import { slotView } from './slot-view';
import { useSlots } from './slots-context';

import { thumbFor } from '@/components/studio/photo-thumb';
import { UPLOAD_ACCEPT } from '@/lib/upload/validate';

/** What the slot is called and what it shows, as `photo_slot` wants them. */
function slotLook(props: SlotBoxProps): Partial<PhotoSlotProps> {
  const { position, view, thumbWidth, slotClassName } = props;
  const picture =
    view.state === 'Uploaded' && view.photo ? thumbFor(view.photo, thumbWidth) : undefined;
  return {
    // Pinned to its box by default, so the box's size is the slot's size
    // however the box came by it: a fixed height, a ratio or a measurement.
    className: slotClassName ?? 'absolute inset-0',
    ...(position === COVER_POSITION ? { subject: 'the cover' } : { badge: true, number: position }),
    ...(picture?.src ? { src: picture.src, alt: view.photo?.alt ?? '' } : {}),
    ...(picture?.placeholderSrc ? { placeholderSrc: picture.placeholderSrc } : {}),
  };
}

/**
 * The `photo_slot` component wired to the upload queue. The second file input
 * is for a retry that has to ask for the file again: the component's own
 * picker is not offered in its Error state.
 */
function SlotBox(props: SlotBoxProps): ReactElement {
  const { position, view } = props;
  const { photos, mutations } = useSlots();
  const picker = useRef<HTMLInputElement>(null);
  const { photo } = view;

  const retry = (): void => {
    if (view.retry === 'upload' && view.uploadKey) photos.retryUpload(view.uploadKey);
    else picker.current?.click();
  };
  const remove =
    photo && view.state === 'Uploaded'
      ? (): void => {
          mutations.removal.ask(photo);
        }
      : undefined;

  return (
    <>
      <PhotoSlot
        state={view.state}
        progress={view.progress}
        accept={UPLOAD_ACCEPT}
        total={GALLERY_SIZE}
        {...slotLook(props)}
        {...(remove ? { onRemove: remove } : {})}
        onFiles={(files) => {
          photos.addFiles(position, files);
        }}
        onRetry={retry}
      />
      <input
        ref={picker}
        type="file"
        accept={UPLOAD_ACCEPT}
        hidden
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          photos.addFiles(position, Array.from(event.target.files ?? []));
          event.target.value = '';
        }}
      />
    </>
  );
}

/**
 * One slot of the album, with the things Figma's component has no place for
 * underneath it: why an upload failed, what publishing found wrong, and the
 * photograph's description.
 */
export function SlotCard(props: SlotCardProps): ReactElement {
  const { position, boxClassName, captionClassName, className, style, boxStyle, overlay } = props;
  const { photos, problems } = useSlots();
  const noteId = useId();
  const view = photos.views.get(position) ?? slotView(undefined, undefined);
  const issue = slotProblems(problems, position);
  const note = view.message ?? issue.slot;

  return (
    <div
      role="group"
      aria-label={position === COVER_POSITION ? 'Cover photograph' : `Slot ${String(position)}`}
      aria-describedby={note ? noteId : undefined}
      data-problem={`photos.${String(position)}`}
      className={cn('flex flex-col gap-[7px]', className)}
      style={style}
    >
      <div className={cn('relative flex', boxClassName)} style={boxStyle}>
        <SlotBox
          position={position}
          view={view}
          thumbWidth={props.thumbWidth}
          slotClassName={props.slotClassName}
        />
        {issue.slot ? (
          <span
            aria-hidden="true"
            className="border-status-error pointer-events-none absolute inset-0 border-[1.5px]"
          />
        ) : null}
        {overlay}
      </div>
      {note || view.photo ? (
        <div className={cn('flex flex-col gap-[7px]', captionClassName)}>
          {note ? (
            <p id={noteId} className="type-studio-caption text-status-error">
              {note}
            </p>
          ) : null}
          {view.photo ? (
            <SlotCaption key={view.photo.id} photo={view.photo} problem={issue.alt} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

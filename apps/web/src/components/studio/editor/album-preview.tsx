'use client';

import { COVER_POSITION } from '@vows/contracts';
import { AlbumBottomBar } from '@vows/ui';
import type { ReactElement } from 'react';
import { useWatch } from 'react-hook-form';

import { useEditor } from './editor-context';
import { PhotoNotices } from './photo-notices';
import { galleryStyle, previewBands } from './preview-layout';
import { SlotCard } from './slot-card';

import { formatDateText, parseDateText } from '@/components/shared/date/date-text';

const BANDS = previewBands();

/** Twice the drawn width, for a sharp picture on a dense screen. */
const DENSITY = 2;

/** The album page's title bar, filled from the form as it is typed. */
function PreviewBar(): ReactElement {
  const { form, album } = useEditor();
  const values = useWatch({ control: form.control });
  const day = parseDateText(values.shotOn ?? '');
  const names = values.coupleNames?.trim();

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex">
      <AlbumBottomBar
        headingLevel="p"
        coupleNames={names ? names : album.title}
        intro={values.story ?? ''}
        type={values.weddingType ?? ''}
        place={values.location ?? ''}
        timeOfDay={(values.timeOfDay ?? '').toLowerCase()}
        date={formatDateText(day)}
        {...(day ? { dateTime: day } : {})}
        labels={{ type: 'type', place: 'location' }}
      />
    </div>
  );
}

/**
 * The cover, the size it has on the album page. Empty, it is the dashed
 * ground with one slot in the middle, as Figma draws it. Filled, the
 * photograph covers the whole of it.
 */
function PreviewCover(): ReactElement {
  const { photos } = useEditor();
  const empty = photos.views.get(COVER_POSITION)?.state === 'Empty';

  return (
    <SlotCard
      position={COVER_POSITION}
      thumbWidth={1600}
      boxClassName={
        empty
          ? 'border-strong bg-slot aspect-[1077/850] items-center justify-center overflow-clip border-[1.5px] border-dashed'
          : 'aspect-[1077/850] overflow-clip'
      }
      slotClassName={empty ? 'h-[256px] w-[289px] max-w-full' : undefined}
      captionClassName="max-w-[320px]"
      overlay={<PreviewBar />}
    />
  );
}

/**
 * The desktop's right-hand panel: the album page as visitors will see it, at
 * the scale the panel allows, with a slot wherever a photograph goes. The
 * bands and their positions are the public gallery's own. What sits under a
 * filled slot — its description and the two move buttons — is the Studio's.
 */
export function AlbumPreview(): ReactElement {
  return (
    <section
      aria-label="Photographs, laid out as on the album page"
      className="gap-space-3 @container flex min-w-0 flex-1 flex-col"
    >
      <PhotoNotices />
      <PreviewCover />
      <div className="flex flex-col" style={galleryStyle}>
        {BANDS.map((band) => (
          <div key={band.key} className="relative" style={band.style}>
            {band.slots.map((slot) => (
              <SlotCard
                key={slot.position}
                position={slot.position}
                thumbWidth={slot.width * DENSITY}
                className="absolute"
                style={{ left: slot.style.left, top: slot.style.top, width: slot.style.width }}
                boxStyle={{ height: slot.style.height }}
                captionClassName="min-w-[150px] max-w-[320px]"
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

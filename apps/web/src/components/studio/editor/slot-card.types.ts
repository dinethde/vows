import type { CSSProperties, ReactNode } from 'react';

import type { SlotView } from './slot-view';

export interface SlotCardProps {
  /** 0 is the cover. 1 to 18 are the gallery, in the order visitors see them. */
  position: number;
  /** How wide the picture is drawn at most, to choose a file no larger than needed. */
  thumbWidth: number;
  /** Classes for the box the slot sits in: its size or its aspect ratio. */
  boxClassName?: string;
  /** Classes for what sits under the box: the failure line and the description. */
  captionClassName?: string;
  /** Classes for the `photo_slot` itself, when it should not fill its box. */
  slotClassName?: string | undefined;
  className?: string;
  /** Where the card sits, when a layout places it by measurement. */
  style?: CSSProperties;
  /** The size of the box, when a layout sets it by measurement. */
  boxStyle?: CSSProperties;
  /** Drawn over the box: the title bar on the preview's cover. */
  overlay?: ReactNode;
}

export interface SlotBoxProps {
  position: number;
  view: SlotView;
  thumbWidth: number;
  slotClassName: string | undefined;
}

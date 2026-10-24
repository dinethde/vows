/** The Figma `State` values of `photo_slot`, spelled as Figma spells them.
 * `Update` is Uploaded with the Replace overlay held open; an Uploaded slot
 * shows the same overlay by itself on hover, focus and drag. */
export type PhotoSlotState = 'Empty' | 'Uploading' | 'Uploaded' | 'Update' | 'Error';

export interface PhotoSlotProps {
  state: PhotoSlotState;
  /** Figma `Badge`: show the position number in the top left corner. */
  badge?: boolean;
  /** Figma `number`: the slot's place in the album, counted from 1. */
  number?: number;
  /** How many slots the album has, for "slot 3 of 18". */
  total?: number;
  /** What to call a slot that has no number, such as "the cover". */
  subject?: string;
  /** Uploading: 0 to 100, from the browser's own upload progress event. */
  progress?: number;
  /** Uploaded: a small derivative, never the original. */
  src?: string;
  /** Uploaded: the photograph's description. */
  alt?: string;
  /** Uploaded: the ThumbHash as a data URL, shown until `src` has loaded. */
  placeholderSrc?: string;
  /** The file types the picker offers. Defaults to images only. */
  accept?: string;
  /** Files chosen in the picker or dropped on the slot. Empty, Uploaded and
   * Update call this; a replacement keeps the slot's number. */
  onFiles?: (files: File[]) => void;
  /** Error: the whole box is the retry button. */
  onRetry?: () => void;
  /** Uploaded and Update: the round cross. Leave it out to hide the cross. */
  onRemove?: () => void;
  className?: string;
}

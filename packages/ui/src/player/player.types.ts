export interface PlayerProps {
  /** Figma `State`: true is Playing, false is Paused. The app owns the
   * `audio` element, above the router; this is only its control. */
  playing: boolean;
  onToggle: () => void;
  /** Figma `Track`: the name shown beside the meter on a desktop. */
  track: string;
  className?: string;
}

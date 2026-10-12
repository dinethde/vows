/** The small captions above the type and the place. The component adds the
 * brackets; Figma writes them "(type)" and "(location)". */
export interface AlbumBottomBarLabels {
  type: string;
  place: string;
}

export interface AlbumBottomBarProps {
  /** "Benali & Yasiru". */
  coupleNames: string;
  /** A short paragraph about the day. It takes whatever width is left over. */
  intro: string;
  /** "Modern Classic". */
  type: string;
  /** "Hilton Residencies". */
  place: string;
  /** "morning". Shown in brackets above the date. */
  timeOfDay: string;
  /** The date as it should read: "2 January 2022". */
  date: string;
  /** The same date for machines, as `YYYY-MM-DD`. */
  dateTime?: string;
  labels: AlbumBottomBarLabels;
  /** The element for the couple's names. On the album page they are the
   * page's `h1`, which is the default. */
  headingLevel?: 'h1' | 'h2' | 'p';
  className?: string;
}

/** Figma writes the sentence three times, shorter at each width, so the bar
 * keeps its height. Only the one for the current width is shown or read out. */
export interface BottomBarIntro {
  mobile: string;
  tablet: string;
  desktop: string;
}

export interface BottomBarProps {
  /** "VOWS". Plain text here: the navbar's wordmark is the link home. */
  wordmark: string;
  /** One short paragraph about the studio. */
  intro: BottomBarIntro;
  /** "Since 2013". One line on a phone, a word per line from the tablet up. */
  since: string;
  className?: string;
}

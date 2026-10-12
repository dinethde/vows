import type { LinkComponent } from '../lib/link.types';

/** What the photo card over the middle digit shows. `empty` is a slot with no
 * photograph (404), `burnt` a print spoiled in developing (500) and `locked`
 * the back of a print with a padlock (403). */
export type ErrorScreenCard = 'empty' | 'burnt' | 'locked';

export interface ErrorScreenLink {
  label: string;
  href: string;
}

export interface ErrorScreenHandler {
  label: string;
  /** The 500 page passes `reset()` from its error boundary. */
  onClick: () => void;
}

/** The one main way out: somewhere to go, or something to try again. */
export type ErrorScreenAction = ErrorScreenLink | ErrorScreenHandler;

export interface ErrorScreenProps {
  /** "404", "500" or "403". Drawn very large and hidden from readers; the
   * document title carries the code. */
  code: string;
  /** One plain sentence. It is the page's only `h1`. */
  headline: string;
  /** What happened and what to do next. */
  subline: string;
  card: ErrorScreenCard;
  /** The small line under the card: "no frame here". Decoration, like the card. */
  caption: string;
  primaryAction: ErrorScreenAction;
  /** Always the home page. A link, never a button. */
  homeLink: ErrorScreenLink;
  /** The app's router link, such as `next/link`. Defaults to `a`. */
  linkComponent?: LinkComponent;
  className?: string;
}

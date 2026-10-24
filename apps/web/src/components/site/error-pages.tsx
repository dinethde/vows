import { ErrorScreen } from '@vows/ui';
import type { ErrorScreenAction } from '@vows/ui';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { ErrorPicture } from './error-picture';

const home = { label: 'Go to the home page', href: '/' };

/** The three screens hold the words. ErrorScreen holds the layout. */
export function NotFoundScreen(): ReactElement {
  return (
    <ErrorScreen
      code="404"
      card="empty"
      picture={<ErrorPicture code="404" />}
      caption="no frame here"
      headline="This page isn’t in the album."
      subline="The link may be old, or the page may have been renamed. Everything we have published is still here."
      primaryAction={{ label: 'Back to the albums', href: '/' }}
      homeLink={home}
      linkComponent={Link}
    />
  );
}

export interface ServerErrorScreenProps {
  action: ErrorScreenAction;
}

export function ServerErrorScreen({ action }: ServerErrorScreenProps): ReactElement {
  return (
    <ErrorScreen
      code="500"
      card="burnt"
      picture={<ErrorPicture code="500" />}
      caption="could not develop"
      headline="Something went wrong on our side."
      subline="Not you — us. We have been told, and we are already looking. Try again in a moment."
      primaryAction={action}
      homeLink={home}
    />
  );
}

export interface PrivateScreenProps {
  signInHref: string;
}

export function PrivateScreen({ signInHref }: PrivateScreenProps): ReactElement {
  return (
    <ErrorScreen
      code="403"
      card="locked"
      picture={<ErrorPicture code="403" />}
      caption="private album"
      headline="This album is private."
      subline="You need to be signed in to the Studio to open this page. If you think that is wrong, get in touch."
      primaryAction={{ label: 'Sign in to the Studio', href: signInHref }}
      homeLink={home}
      linkComponent={Link}
    />
  );
}

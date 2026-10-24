import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { LinkComponentProps } from '../lib/link.types';

import { ErrorScreen } from './error-screen';
import type { ErrorScreenCard, ErrorScreenProps } from './error-screen.types';

const notFound: ErrorScreenProps = {
  code: '404',
  headline: 'This page isn’t in the album.',
  subline:
    'The link may be old, or the page may have been renamed. Everything we have published is still here.',
  card: 'empty',
  caption: 'no frame here',
  primaryAction: { label: 'Back to the albums', href: '/' },
  homeLink: { label: 'Go to the home page', href: '/' },
};

function RouterLink({ href, className, children }: LinkComponentProps): ReactElement {
  return (
    <a href={href} className={className} data-router="true">
      {children}
    </a>
  );
}

describe('ErrorScreen', () => {
  it('has the headline as its only h1', () => {
    render(<ErrorScreen {...notFound} />);

    expect(screen.getAllByRole('heading')).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 1, name: 'This page isn’t in the album.' }),
    ).toBeInTheDocument();
  });

  it('says what happened and what to do next', () => {
    render(<ErrorScreen {...notFound} />);

    expect(screen.getByText(notFound.subline)).toBeInTheDocument();
  });

  it('hides the numeral, the card and its caption from assistive technology', () => {
    render(<ErrorScreen {...notFound} />);

    expect(screen.getByText('404').closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText('no frame here').closest('[aria-hidden="true"]')).not.toBeNull();
    expect(document.querySelector('[data-card]')?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it.each<ErrorScreenCard>(['empty', 'burnt', 'locked'])('draws the %s card', (card) => {
    render(<ErrorScreen {...notFound} card={card} />);

    expect(document.querySelector(`[data-card="${card}"]`)).toBeInTheDocument();
  });

  it('links the primary action when it has somewhere to go', () => {
    render(
      <ErrorScreen
        {...notFound}
        primaryAction={{ label: 'Sign in to the Studio', href: '/sign-in' }}
      />,
    );

    expect(screen.getByRole('link', { name: 'Sign in to the Studio' })).toHaveAttribute(
      'href',
      '/sign-in',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('makes the primary action a button when it has something to do', async () => {
    const reset = vi.fn();
    render(<ErrorScreen {...notFound} primaryAction={{ label: 'Try again', onClick: reset }} />);

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(reset).toHaveBeenCalledOnce();
  });

  it('offers the home page as a link, after the primary action', async () => {
    render(<ErrorScreen {...notFound} primaryAction={{ label: 'Try again', onClick: vi.fn() }} />);

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Try again' })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'Go to the home page' })).toHaveFocus();
  });

  it('uses the link component the app passes in', () => {
    render(<ErrorScreen {...notFound} linkComponent={RouterLink} />);

    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('data-router', 'true');
    }
  });

  it('fills the print with the picture it is given, hidden from readers like the card', () => {
    const { container } = render(
      <ErrorScreen {...notFound} picture={<img src="/404.webp" alt="" data-testid="gif" />} />,
    );
    const card = container.querySelector('[data-card]');

    expect(card?.querySelector('[data-testid="gif"]')).not.toBeNull();
    expect(card?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('keeps its drawing when no picture is given', () => {
    const { container } = render(<ErrorScreen {...notFound} />);

    expect(container.querySelector('[data-card] img')).toBeNull();
    expect(container.querySelector('[data-card] svg')).not.toBeNull();
  });
});

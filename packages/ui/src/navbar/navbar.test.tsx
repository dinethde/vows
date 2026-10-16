import { render, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { LinkComponentProps } from '../lib/link.types';
import { Player } from '../player';

import { Navbar } from './navbar';

const links = {
  home: { label: 'VOWS', href: '/' },
  contact: { label: 'Contact', href: '/contact' },
  cta: { label: 'Chat with Dinuka', href: '/contact?form=open' },
};

const player = <Player playing={false} track="First Light" onToggle={vi.fn()} />;

function RouterLink({ href, className, children }: LinkComponentProps): ReactElement {
  return (
    <a href={href} className={className} data-router="true">
      {children}
    </a>
  );
}

describe('Navbar', () => {
  it('is the page banner, with the wordmark linking home', () => {
    render(<Navbar {...links} player={player} />);
    const banner = screen.getByRole('banner');

    expect(within(banner).getByRole('link', { name: 'VOWS' })).toHaveAttribute('href', '/');
  });

  it('carries the Contact link and the call to action, and no other links', () => {
    render(<Navbar {...links} player={player} />);
    const nav = screen.getByRole('navigation');

    expect(within(nav).getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact');
    expect(within(nav).getByRole('link', { name: 'Chat with Dinuka' })).toHaveAttribute(
      'href',
      '/contact?form=open',
    );
    expect(screen.queryByRole('link', { name: 'Portfolio' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'About' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('shows the player it is handed', () => {
    render(<Navbar {...links} player={player} />);

    expect(screen.getByRole('button', { name: 'Play the music' })).toBeInTheDocument();
  });

  it('keeps reading order: wordmark, player, then the links', () => {
    render(<Navbar {...links} player={player} />);
    const order = Array.from(screen.getByRole('banner').querySelectorAll('a, button')).map(
      (element) => element.getAttribute('aria-label') ?? element.textContent,
    );

    expect(order).toEqual(['VOWS', 'Play the music', 'Contact', 'Chat with Dinuka']);
  });

  it('is the wordmark alone when minimal, for the 500 page', () => {
    render(<Navbar {...links} player={player} minimal />);

    expect(screen.getByRole('link', { name: 'VOWS' })).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('uses the link component the app passes in', () => {
    render(<Navbar {...links} linkComponent={RouterLink} />);

    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('data-router', 'true');
    }
  });
});

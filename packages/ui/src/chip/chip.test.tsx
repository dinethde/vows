import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Chip } from './chip';

describe('Chip', () => {
  it('announces whether it is chosen', () => {
    const { rerender } = render(<Chip selected={false}>Destination</Chip>);
    const chip = screen.getByRole('button', { name: 'Destination' });

    expect(chip).toHaveAttribute('aria-pressed', 'false');

    rerender(<Chip selected>Destination</Chip>);

    expect(chip).toHaveAttribute('aria-pressed', 'true');
  });

  it('says nothing about being pressed when it is not a choice', () => {
    render(<Chip>Instagram</Chip>);

    expect(screen.getByRole('button', { name: 'Instagram' })).not.toHaveAttribute('aria-pressed');
  });

  it('can be chosen from the keyboard', async () => {
    const onClick = vi.fn();
    render(
      <Chip selected={false} onClick={onClick}>
        Destination
      </Chip>,
    );

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders the link it is given', () => {
    render(
      <Chip asChild>
        <a href="https://www.instagram.com/vows">Instagram</a>
      </Chip>,
    );

    expect(screen.getByRole('link', { name: 'Instagram' })).toBeInTheDocument();
  });
});

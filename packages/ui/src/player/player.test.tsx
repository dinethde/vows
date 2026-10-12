import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Player } from './player';

function Controlled(): ReactElement {
  const [playing, setPlaying] = useState(false);
  return (
    <Player
      playing={playing}
      track="First Light"
      onToggle={() => {
        setPlaying((value) => !value);
      }}
    />
  );
}

describe('Player', () => {
  it('offers to play while paused', () => {
    render(<Player playing={false} track="First Light" onToggle={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Play the music' })).toBeInTheDocument();
  });

  it('offers to pause while playing', () => {
    render(<Player playing track="First Light" onToggle={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Pause the music' })).toBeInTheDocument();
  });

  it('flips its name each time it is pressed', async () => {
    render(<Controlled />);

    await userEvent.click(screen.getByRole('button', { name: 'Play the music' }));

    expect(screen.getByRole('button', { name: 'Pause the music' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Pause the music' }));

    expect(screen.getByRole('button', { name: 'Play the music' })).toBeInTheDocument();
  });

  it('does not decide for itself: it only reports the press', async () => {
    const onToggle = vi.fn();
    render(<Player playing={false} track="First Light" onToggle={onToggle} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onToggle).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Play the music' })).toBeInTheDocument();
  });

  it('works from the keyboard', async () => {
    const onToggle = vi.fn();
    render(<Player playing={false} track="First Light" onToggle={onToggle} />);

    await userEvent.tab();
    await userEvent.keyboard(' ');

    expect(screen.getByRole('button')).toHaveFocus();
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('hides the meter and the track name from assistive technology', () => {
    const { container } = render(<Player playing track="First Light" onToggle={vi.fn()} />);

    expect(screen.getByText('First Light')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('[aria-hidden="true"] > span')).toHaveLength(4);
  });

  it('owns no audio element', () => {
    const { container } = render(<Player playing track="First Light" onToggle={vi.fn()} />);

    expect(container.querySelector('audio')).not.toBeInTheDocument();
  });
});

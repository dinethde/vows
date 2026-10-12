import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './button';

describe('Button', () => {
  it('is a button that does not submit a form unless asked to', () => {
    render(<Button>Confirm</Button>);

    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveAttribute('type', 'button');
  });

  it('runs its handler when pressed', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Publish album</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Publish album' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('ignores presses while disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Publish album
      </Button>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Publish album' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('stays focusable and reports busy while pending, and swallows the press', async () => {
    const onClick = vi.fn();
    render(
      <Button pending onClick={onClick}>
        Delete photograph
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Delete photograph' });

    await userEvent.click(button);

    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    expect(button).toHaveFocus();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders the link it is given when asChild is set', () => {
    render(
      <Button variant="nav" asChild>
        <a href="/contact">Chat with Dinuka</a>
      </Button>,
    );

    expect(screen.getByRole('link', { name: 'Chat with Dinuka' })).toHaveAttribute(
      'href',
      '/contact',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

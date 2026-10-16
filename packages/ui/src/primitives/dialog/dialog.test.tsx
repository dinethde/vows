import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './dialog';

function Example() {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogTitle>Publish this album?</DialogTitle>
        <DialogDescription>It goes live on vows.lk.</DialogDescription>
        <DialogClose>Cancel</DialogClose>
      </DialogContent>
    </Dialog>
  );
}

describe('Dialog', () => {
  it('opens from its trigger, named and described by its title and text', async () => {
    render(<Example />);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog', { name: 'Publish this album?' });

    expect(dialog).toHaveAccessibleDescription('It goes live on vows.lk.');
  });

  it('closes on Escape and gives the focus back to the trigger', async () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Open' });

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('keeps the Tab key inside while it is open', async () => {
    render(<Example />);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.tab();
    await userEvent.tab();

    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
  });
});

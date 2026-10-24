import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmationModal } from './confirmation-modal';
import type { ConfirmationModalProps } from './confirmation-modal.types';

const publish = {
  title: 'Publish this album?',
  message:
    'It goes live on vows.lk and the album page is rebuilt, usually within a minute. You can move it back to draft at any time.',
  confirmLabel: 'Publish album',
} as const;

const remove = {
  tone: 'danger',
  title: 'Delete this photograph?',
  message: 'It is removed from this album and from vows.lk.',
  confirmLabel: 'Delete photograph',
} as const;

function setup(props: Partial<ConfirmationModalProps> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmationModal open {...publish} onConfirm={onConfirm} onCancel={onCancel} {...props} />,
  );
  return { onConfirm, onCancel };
}

function WithTrigger(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
        }}
      >
        Publish
      </button>
      <ConfirmationModal
        open={open}
        {...publish}
        onConfirm={vi.fn()}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </>
  );
}

describe('ConfirmationModal', () => {
  it('is a dialog named by its question and described by what will happen', () => {
    setup();

    expect(screen.getByRole('dialog', { name: 'Publish this album?' })).toHaveAccessibleDescription(
      publish.message,
    );
  });

  it('is an alertdialog when something is taken away', () => {
    setup(remove);

    expect(
      screen.getByRole('alertdialog', { name: 'Delete this photograph?' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('puts the focus on Cancel, not on the confirm button', () => {
    setup(remove);

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('confirms with the button that repeats the verb', async () => {
    const { onConfirm, onCancel } = setup(remove);

    await userEvent.click(screen.getByRole('button', { name: 'Delete photograph' }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('cancels on Escape', async () => {
    const { onConfirm, onCancel } = setup();

    await userEvent.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('cancels from the Cancel button', async () => {
    const { onCancel } = setup();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('cancels from the ×', async () => {
    const { onCancel } = setup();

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('cancels when the dimmed area is pressed', async () => {
    const { onCancel } = setup();
    const scrim = document.querySelector('[data-slot="dialog-overlay"]');
    if (scrim === null) throw new Error('the modal has no scrim');

    await userEvent.click(scrim);

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('does not confirm on a stray Enter', async () => {
    const { onConfirm, onCancel } = setup(remove);

    await userEvent.keyboard('{Enter}');

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('stays open and busy while the request is in flight', async () => {
    const { onConfirm } = setup({ pending: true });
    const confirm = screen.getByRole('button', { name: 'Publish album' });

    await userEvent.click(confirm);

    expect(confirm).toHaveAttribute('aria-busy', 'true');
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows the reason when the request failed, and stays open', () => {
    setup({ error: 'This album still has three empty slots.' });

    expect(screen.getByRole('alert')).toHaveTextContent('This album still has three empty slots.');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders nothing while closed', () => {
    setup({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('gives the focus back to the control that opened it', async () => {
    render(<WithTrigger />);
    const trigger = screen.getByRole('button', { name: 'Publish' });

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

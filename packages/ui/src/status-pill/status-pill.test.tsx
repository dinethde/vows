import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatusPill } from './status-pill';
import type { StatusPillState } from './status-pill.types';

describe('StatusPill', () => {
  it.each<StatusPillState>(['Published', 'Draft', 'Untouched'])(
    'says %s in words, not only in colour',
    (state) => {
      render(<StatusPill state={state} />);

      expect(screen.getByText(state)).toBeInTheDocument();
    },
  );

  it('colours each state differently', () => {
    render(
      <>
        <StatusPill state="Published" />
        <StatusPill state="Draft" />
        <StatusPill state="Untouched" />
      </>,
    );
    const classes = ['Published', 'Draft', 'Untouched'].map(
      (state) => screen.getByText(state).className,
    );

    expect(new Set(classes).size).toBe(3);
  });
});

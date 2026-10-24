import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BottomBar } from './bottom-bar';

const intro = {
  mobile: 'We stay out of the way and keep the pictures that still feel like the day.',
  tablet:
    'We have photographed weddings in Sri Lanka since 2013 — in temples and on beaches, at midday and long after dark.',
  desktop:
    'We have photographed weddings in Sri Lanka since 2013 — in temples and on beaches, at midday and long after dark. We stay out of the way, and we keep the pictures that still feel like the day.',
};

describe('BottomBar', () => {
  it('shows the wordmark, the paragraph and the year', () => {
    render(<BottomBar wordmark="VOWS" intro={intro} since="Since 2013" />);

    expect(screen.getByText('VOWS')).toBeInTheDocument();
    expect(screen.getByText('Since 2013')).toBeInTheDocument();
    expect(screen.getByText(intro.desktop)).toBeInTheDocument();
  });

  it('carries the sentence for each width in one paragraph, chosen by CSS', () => {
    render(<BottomBar wordmark="VOWS" intro={intro} since="Since 2013" />);
    const paragraph = screen.getByText(intro.mobile).closest('p');

    expect(paragraph).toContainElement(screen.getByText(intro.tablet));
    expect(paragraph).toContainElement(screen.getByText(intro.desktop));
  });

  it('has no links or buttons: it is about the studio, not a way out', () => {
    render(<BottomBar wordmark="VOWS" intro={intro} since="Since 2013" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('hides its backdrop from assistive technology', () => {
    const { container } = render(<BottomBar wordmark="VOWS" intro={intro} since="Since 2013" />);

    expect(container.firstElementChild?.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});

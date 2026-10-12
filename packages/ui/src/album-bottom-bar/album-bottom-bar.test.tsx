import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AlbumBottomBar } from './album-bottom-bar';
import type { AlbumBottomBarProps } from './album-bottom-bar.types';

const album: AlbumBottomBarProps = {
  coupleNames: 'Benali & Yasiru',
  intro:
    'An intimate celebration beneath the late-summer sky, filled with quiet glances, joyful tears, and the people they love most.',
  type: 'Modern Classic',
  place: 'Hilton Residencies',
  timeOfDay: 'morning',
  date: '2 January 2022',
  dateTime: '2022-01-02',
  labels: { type: 'type', place: 'location' },
};

describe('AlbumBottomBar', () => {
  it('makes the couple’s names the page heading', () => {
    render(<AlbumBottomBar {...album} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Benali & Yasiru' })).toBeInTheDocument();
  });

  it('can step down when the page already has its heading', () => {
    render(<AlbumBottomBar {...album} headingLevel="h2" />);

    expect(screen.getByRole('heading', { level: 2, name: 'Benali & Yasiru' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('shows the paragraph about the day', () => {
    render(<AlbumBottomBar {...album} />);

    expect(screen.getByText(album.intro)).toBeInTheDocument();
  });

  it('pairs each caption with its value', () => {
    render(<AlbumBottomBar {...album} />);
    const terms = screen.getAllByRole('term').map((term) => term.textContent);
    const values = screen.getAllByRole('definition').map((value) => value.textContent);

    expect(terms).toEqual(['(type)', '(location)', '(morning)']);
    expect(values).toEqual(['Modern Classic', 'Hilton Residencies', '2 January 2022']);
  });

  it('gives the date to machines as well as to people', () => {
    render(<AlbumBottomBar {...album} />);

    expect(screen.getByText('2 January 2022')).toHaveAttribute('datetime', '2022-01-02');
  });
});

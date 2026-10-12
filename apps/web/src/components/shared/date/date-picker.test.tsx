import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { monthWeeks, moveByKey, shiftMonths } from './calendar';
import { DatePicker } from './date-picker';
import { formatDateText, parseDateText } from './date-text';

afterEach(cleanup);

function Harness({ initial = '' }: { initial?: string }): ReactElement {
  const [value, setValue] = useState(initial);
  return (
    <>
      <DatePicker label="Wedding date" value={value} onChange={setValue} />
      <button type="button">Elsewhere</button>
    </>
  );
}

const box = (): HTMLInputElement => screen.getByLabelText<HTMLInputElement>('Wedding date');
const focusedDay = (): string | null => document.activeElement?.getAttribute('aria-label') ?? null;

describe('reading a typed date', () => {
  it('accepts the ways a person writes one', () => {
    expect(parseDateText('17 January 2025')).toBe('2025-01-17');
    expect(parseDateText('17 jan 2025')).toBe('2025-01-17');
    expect(parseDateText('17th January, 2025')).toBe('2025-01-17');
    expect(parseDateText('17/01/2025')).toBe('2025-01-17');
    expect(parseDateText('2025-01-17')).toBe('2025-01-17');
  });

  it('refuses what is not a real day', () => {
    expect(parseDateText('31 February 2025')).toBeNull();
    expect(parseDateText('January 2025')).toBeNull();
    expect(parseDateText('soon')).toBeNull();
  });

  it('always writes a date in full', () => {
    expect(formatDateText('2025-01-07')).toBe('7 January 2025');
    expect(formatDateText(null)).toBe('');
  });
});

describe('calendar arithmetic', () => {
  it('draws whole weeks from Sunday, with the days either side', () => {
    const weeks = monthWeeks('2027-01-14');
    expect(weeks).toHaveLength(6);
    expect(weeks[0]?.[0]).toBe('2026-12-27');
    expect(weeks.at(-1)?.at(-1)).toBe('2027-02-06');
  });

  it('moves by day, week, end of week and month', () => {
    expect(moveByKey('2027-01-14', 'ArrowLeft')).toBe('2027-01-13');
    expect(moveByKey('2027-01-14', 'ArrowDown')).toBe('2027-01-21');
    expect(moveByKey('2027-01-14', 'Home')).toBe('2027-01-10');
    expect(moveByKey('2027-01-14', 'End')).toBe('2027-01-16');
    expect(moveByKey('2027-01-31', 'PageDown')).toBe('2027-02-28');
    expect(moveByKey('2027-01-14', 'a')).toBeNull();
    expect(shiftMonths('2027-03-31', -1)).toBe('2027-02-28');
  });
});

describe('the date picker', () => {
  it('opens a month under the box when the box is entered', async () => {
    render(<Harness />);
    expect(screen.queryByRole('dialog')).toBeNull();

    await userEvent.click(box());

    expect(screen.getByRole('dialog', { name: 'Choose the wedding date' })).toBeTruthy();
    expect(box().getAttribute('aria-expanded')).toBe('true');
  });

  it('follows what is typed, and marks the typed day as chosen', async () => {
    render(<Harness />);
    await userEvent.click(box());
    await userEvent.keyboard('14 January 2027');

    expect(screen.getByRole('grid', { name: 'January 2027' })).toBeTruthy();
    const day = screen.getByRole('button', { name: '14 January 2027' });
    expect(day.getAttribute('aria-pressed')).toBe('true');
  });

  it('moves through the days with the arrow keys and across months', async () => {
    render(<Harness initial="14 January 2027" />);
    await userEvent.click(box());

    await userEvent.keyboard('{ArrowDown}');
    expect(focusedDay()).toBe('14 January 2027');
    await userEvent.keyboard('{ArrowRight}');
    expect(focusedDay()).toBe('15 January 2027');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(focusedDay()).toBe('5 February 2027');
    expect(screen.getByRole('grid', { name: 'February 2027' })).toBeTruthy();
    await userEvent.keyboard('{PageUp}{Home}');
    expect(focusedDay()).toBe('3 January 2027');
  });

  it('writes the picked day in full and gives the focus back to the box', async () => {
    render(<Harness initial="14 January 2027" />);
    await userEvent.click(box());
    await userEvent.keyboard('{ArrowDown}{ArrowLeft}{Enter}');

    expect(box().value).toBe('13 January 2027');
    expect(document.activeElement).toBe(box());
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes on Escape, returns to the box and does not open again by itself', async () => {
    render(<Harness initial="14 January 2027" />);
    await userEvent.click(box());
    await userEvent.keyboard('{ArrowDown}{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(box());
    expect(box().value).toBe('14 January 2027');
  });

  it('closes when the focus leaves for something else', async () => {
    render(<Harness />);
    await userEvent.click(box());
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('ties an error to the box', () => {
    render(
      <DatePicker
        label="Wedding date"
        value="soon"
        onChange={() => undefined}
        error="Write the date in full, like 17 January 2025."
      />,
    );
    expect(box().getAttribute('aria-invalid')).toBe('true');
    const described = box().getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(described.trim())?.textContent).toMatch(/in full/);
  });
});

import type { Page } from '@playwright/test';

/** The home page asks about the music on a first visit. Tests answer no, as a visitor would with a tap. */
export async function enterHome(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Continue without the music' }).click();
}

/** The album every environment is seeded with. */
export const SEEDED_ALBUM = { slug: 'benali-yasiru', names: 'Benali & Yasiru' };

import { join } from 'node:path';

import { clerk, setupClerkTestingToken } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { SEEDED_ALBUM } from './helpers';

/**
 * The photographer's journeys in the Studio, signed in for real through Clerk
 * against the real API. They need a Clerk instance whose session token carries
 * `public_metadata`, a user with the owner role (`E2E_STUDIO_USER`), and the
 * secret key, so they run only when that is all set. They change shared data,
 * so they run one after another, on the desktop only, and put it back.
 */
const USER = process.env.E2E_STUDIO_USER;
const ALBUM = 'alb_000020';
const PHOTO = join(__dirname, 'fixtures', 'photo.jpg');

test.describe.configure({ mode: 'serial' });
test.skip(!USER, 'Needs E2E_STUDIO_USER and the Clerk keys.');
test.skip(({ isMobile }) => isMobile, 'The Studio journeys run on the desktop.');

async function signIn(page: Page): Promise<void> {
  await setupClerkTestingToken({ page });
  await page.goto('/studio/sign-in');
  await clerk.signIn({ page, emailAddress: USER ?? '' });
}

test('the photographer signs in and sees every album', async ({ page }) => {
  await signIn(page);
  const response = await page.goto('/studio');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('link', { name: new RegExp(SEEDED_ALBUM.names) })).toBeVisible();
});

test('a photograph is uploaded and becomes ready', async ({ page }) => {
  test.setTimeout(150_000);
  await signIn(page);
  await page.goto(`/studio/albums/${ALBUM}`);

  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Add photo for slot 1 of 18' }).click();
  await (await chooser).setFiles(PHOTO);
  await expect(
    page.getByRole('button', { name: /Uploading photo for slot 1 of 18/ }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Replace photo for slot 1 of 18' })).toBeVisible({
    timeout: 120_000,
  });
});

test('publishing without a description is refused, and names the photograph', async ({ page }) => {
  await signIn(page);
  await page.goto(`/studio/albums/${ALBUM}`);
  await page.getByRole('button', { name: 'Publish' }).filter({ visible: true }).click();
  await expect(page.getByText('Describe the photograph in slot 1.').first()).toBeVisible();

  // Put the album back as it was: no photograph in slot 1.
  await page.getByRole('button', { name: 'Remove photo from slot 1 of 18' }).click();
  await page.getByRole('button', { name: 'Delete photograph' }).click();
  await expect(page.getByRole('button', { name: 'Add photo for slot 1 of 18' })).toBeVisible();
});

test('a complete album goes off the site and back on', async ({ page, request }) => {
  test.setTimeout(150_000);
  const live = `/albums/${SEEDED_ALBUM.slug}`;
  const status = async (): Promise<number> => (await request.get(live)).status();
  await signIn(page);
  await page.goto('/studio/albums/alb_000001');

  // The editor draws its actions twice, for wide and narrow screens; one is hidden.
  await page.getByRole('button', { name: 'Move to draft' }).filter({ visible: true }).click();
  await page
    .getByRole('dialog', { name: 'Move this album back to draft?' })
    .getByRole('button', { name: 'Move to draft' })
    .click();
  await expect.poll(status, { timeout: 60_000 }).toBe(404);

  // Moving to draft returns to the dashboard; publishing is done from the editor.
  await page.goto('/studio/albums/alb_000001');
  await page.getByRole('button', { name: 'Publish' }).filter({ visible: true }).click();
  await page
    .getByRole('dialog', { name: 'Publish this album?' })
    .getByRole('button', { name: 'Publish album' })
    .click();
  await expect.poll(status, { timeout: 60_000 }).toBe(200);
});

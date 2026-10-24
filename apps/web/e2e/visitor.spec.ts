import { expect, test } from '@playwright/test';

import { enterHome, SEEDED_ALBUM } from './helpers';

test('a visitor lands on the home page, opens an album, and sees photographs', async ({ page }) => {
  await enterHome(page);
  await expect(page.getByRole('heading', { level: 1, name: 'VOWS Weddings' })).toBeVisible();

  const tile = page.getByRole('link', { name: new RegExp(SEEDED_ALBUM.names) }).first();
  await tile.focus();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(new RegExp(`/albums/${SEEDED_ALBUM.slug}$`));
  await expect(page.getByRole('heading', { level: 1, name: SEEDED_ALBUM.names })).toBeVisible();

  const photographs = page.getByRole('region', { name: 'Photographs' }).getByRole('img');
  await expect(photographs).toHaveCount(18);
  // Every photograph is described; an empty description would be a publish-gate failure.
  for (const alt of await photographs.evaluateAll((images) =>
    images.map((image) => image.getAttribute('alt')),
  )) {
    expect(alt?.trim().length).toBeGreaterThan(10);
  }
});

test('the music is never fetched unless the visitor asks for it', async ({ page }) => {
  const audio: string[] = [];
  page.on('request', (request) => {
    if (/\.(m4a|ogg|mp3)(\?|$)/.test(request.url())) audio.push(request.url());
  });
  await enterHome(page);
  await page.goto(`/albums/${SEEDED_ALBUM.slug}`);
  expect(audio).toEqual([]);
});

test('an album that does not exist is a real 404, with a way back', async ({ page }) => {
  const response = await page.goto('/albums/nobody-by-this-name');
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole('heading', { level: 1, name: 'This page isn’t in the album.' }),
  ).toBeVisible();
  await expect(page).toHaveTitle('404 · Vows');
  await expect(page.getByRole('link', { name: 'Go to the home page' })).toBeVisible();
});

test('a page that does not exist is a real 404 too', async ({ page }) => {
  const response = await page.goto('/no-such-page');
  expect(response?.status()).toBe(404);
});

test('the footer waits until the page has slid fully off it', async ({ page }) => {
  await page.goto('/contact');
  const footer = page.locator('footer');
  const endTop = (): Promise<number> =>
    page.locator('[data-page-end]').evaluate((marker) => marker.getBoundingClientRect().top);

  // Just short of the end, with the page still covering the top of the footer.
  const remaining = await endTop();
  await page.evaluate((by) => {
    window.scrollBy(0, by);
  }, remaining - 40);
  await expect.poll(endTop).toBeGreaterThan(30);
  await page.waitForTimeout(300);
  await expect(footer).toHaveAttribute('data-revealed', 'false');

  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await expect(footer).toHaveAttribute('data-revealed', 'true');
});

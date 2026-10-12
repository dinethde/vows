import { expect, test } from '@playwright/test';

test('a visitor sends an enquiry and sees the thank-you in place of the form', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Let’s talk' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('textbox', { name: 'Your name' })).toBeFocused();

  await dialog.getByRole('textbox', { name: 'Your name' }).fill('Playwright Visitor');
  await dialog
    .getByRole('textbox', { name: 'Email' })
    .fill(`e2e-${String(Date.now())}@example.com`);
  await dialog.getByRole('textbox', { name: 'Mobile' }).fill('+94 71 000 0000');
  await dialog.getByLabel('Wedding date').fill('2030-02-14');
  await dialog
    .getByRole('textbox', { name: 'Additional notes' })
    .fill('Sent by the end-to-end suite.');

  // A person takes longer than three seconds over six fields. So does this.
  await page.waitForTimeout(3200);
  await dialog.getByRole('button', { name: 'Send' }).click();

  await expect(dialog.getByText('Your message is on its way.')).toBeVisible();
  await expect(dialog.getByRole('textbox')).toHaveCount(0);
});

test('a half-typed email is marked when the visitor leaves the field, and says what to do', async ({
  page,
}) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Let’s talk' }).click();
  const email = page.getByRole('textbox', { name: 'Email' });

  await email.fill('benali.perera@gmail');
  await page.getByRole('textbox', { name: 'Mobile' }).focus();

  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(
    page.getByText('That does not look like a full email address. Try name@example.com'),
  ).toBeVisible();
});

test('Escape closes the form and puts focus back on the button that opened it', async ({
  page,
}) => {
  await page.goto('/contact');
  const open = page.getByRole('button', { name: 'Let’s talk' });
  await open.click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(open).toBeFocused();
});

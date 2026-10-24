import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { SEEDED_ALBUM } from './helpers';

const ROUTES = ['/contact', '/privacy', `/albums/${SEEDED_ALBUM.slug}`, '/no-such-page'];

/**
 * Two colour pairs in the Figma tokens are below the 4.5:1 that WCAG AA and
 * chapter 17 ask for. They are design decisions, so they are listed here and
 * not papered over in a component. Dineth has them on his list. Anything else
 * that fails contrast still fails this test.
 *
 *   text/accent on bg/page  3.27:1  the small blue column labels
 *   text/muted  on bg/page  4.21:1  captions, the legal line, the error subline
 */
const KNOWN_TOKEN_PAIRS = ['#1389ff on #f8f8f9', '#777779 on #f8f8f9'];

interface ContrastData {
  fgColor?: string;
  bgColor?: string;
}

async function violations(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  return results.violations.flatMap((violation) =>
    violation.nodes
      .filter((node) => {
        if (violation.id !== 'color-contrast') return true;
        const data = node.any[0]?.data as ContrastData | undefined;
        return !KNOWN_TOKEN_PAIRS.includes(`${data?.fgColor ?? ''} on ${data?.bgColor ?? ''}`);
      })
      .map((node) => `${violation.id}: ${node.html.slice(0, 80)}`),
  );
}

for (const route of ROUTES) {
  test(`${route} has no accessibility violations axe can find`, async ({ page }) => {
    await page.goto(route);
    expect(await violations(page)).toEqual([]);
  });
}

test('the home page has no accessibility violations once the music question is answered', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Continue without the music' }).click();
  expect(await violations(page)).toEqual([]);
});

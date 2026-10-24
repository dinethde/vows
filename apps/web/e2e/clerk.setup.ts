import { clerkSetup } from '@clerk/testing/playwright';
import { test as setup } from '@playwright/test';

/**
 * Gets a Clerk testing token once for the run, so the Studio tests are not
 * stopped by Clerk's bot protection. Only runs when the Studio tests will.
 */
setup('a Clerk testing token for the run', async () => {
  setup.skip(!process.env.E2E_STUDIO_USER, 'The Studio tests are not configured.');
  process.env.CLERK_PUBLISHABLE_KEY ??= process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  await clerkSetup();
});

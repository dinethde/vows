import type { INestApplicationContext } from "@nestjs/common";
import { CleanupService, HousekeepingService } from "@vows/server";

/**
 * The nightly tidy: enquiries past twenty-four months go, and so does any
 * photograph whose grace period ran out without a publish to trigger cleanup.
 */
export function housekeepingArchive(app: INestApplicationContext): () => Promise<void> {
  const housekeeping = app.get(HousekeepingService);
  const cleanup = app.get(CleanupService);
  return async () => {
    await housekeeping.deleteOldEnquiries();
    await cleanup.run();
  };
}

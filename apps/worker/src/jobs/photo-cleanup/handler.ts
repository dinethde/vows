import type { INestApplicationContext } from "@nestjs/common";
import type { JobPayload } from "@vows/contracts";
import { CleanupService } from "@vows/server";

/** Deletes only what has been out of an album past its grace period. Usually nothing. */
export function photoCleanup(
  app: INestApplicationContext,
): (payload: JobPayload<"photo.cleanup">) => Promise<void> {
  const cleanup = app.get(CleanupService);
  return async ({ albumId }) => {
    await cleanup.run(albumId);
  };
}

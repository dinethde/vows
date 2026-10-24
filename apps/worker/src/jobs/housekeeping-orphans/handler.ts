import type { INestApplicationContext } from '@nestjs/common';
import { HousekeepingService } from '@vows/server';

/** Counts and reports. It never deletes: see the restore runbook in chapter 30. */
export function housekeepingOrphans(app: INestApplicationContext): () => Promise<void> {
  const housekeeping = app.get(HousekeepingService);
  return async () => {
    await housekeeping.countOrphans();
  };
}

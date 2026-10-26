import type { INestApplicationContext } from "@nestjs/common";
import { BackupService, LOGGER } from "@vows/server";
import type { Logger } from "@vows/server";

/** Sunday, 02:00 in Colombo. The size goes in the log so a shrinking dump is noticed. */
export function dbBackup(app: INestApplicationContext): () => Promise<void> {
  const backup = app.get(BackupService);
  const log = app.get<Logger>(LOGGER);
  return async () => {
    log.info(await backup.run(), "database backed up");
  };
}

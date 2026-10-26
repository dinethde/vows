import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { BackupService } from "../src/modules/backup/backup.service";
import { StorageService } from "../src/storage/storage.service";
import { hasDatabase, startApp } from "./harness";
import type { Harness } from "./harness";

/** Needs pg_dump on the path, a direct database URL and the backups bucket. */
const live =
  hasDatabase && process.env.PIPELINE_LIVE === "1" && Boolean(process.env.R2_BUCKET_BACKUPS);

describe.skipIf(!live)("db.backup", () => {
  let harness: Harness;

  beforeAll(async () => {
    harness = await startApp();
  });

  afterAll(async () => {
    await harness.app.close();
  });

  it("writes one dump for the day, and a second run overwrites it", async () => {
    const backup = harness.app.get(BackupService);
    const storage = harness.app.get(StorageService);
    const bucket = process.env.R2_BUCKET_BACKUPS ?? "";

    const first = await backup.run();
    const second = await backup.run();

    expect(first.key).toMatch(/^backups\/\d{4}-\d{2}-\d{2}\.dump$/);
    expect(second.key).toBe(first.key);
    expect(first.bytes).toBeGreaterThan(1000);
    expect((await storage.listBackups(bucket)).filter((key) => key === first.key)).toHaveLength(1);
  });
});

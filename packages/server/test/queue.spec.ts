import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { QueueService } from "../src/queue/queue.service";
import { hasDatabase, startApp } from "./harness";
import type { Harness } from "./harness";

const MARK = `req_rollback_${String(Date.now())}`;

/** A job and the row it refers to are written together or not at all. */
describe.skipIf(!hasDatabase)("a job written inside a transaction", () => {
  let harness: Harness;
  let queue: QueueService;

  const jobs = async (): Promise<number> => {
    const found = await harness.db.execute(
      sql`select count(*)::int as count from pgboss.job where name = 'photo.cleanup' and data->>'requestId' = ${MARK}`,
    );
    return (found.rows[0] as { count: number }).count;
  };

  beforeAll(async () => {
    harness = await startApp();
    queue = harness.app.get(QueueService);
  });

  afterAll(async () => {
    await harness.db.execute(sql`delete from pgboss.job where data->>'requestId' = ${MARK}`);
    await harness.app.close();
  });

  it("is gone when the transaction rolls back", async () => {
    const attempt = harness.db.transaction(async (tx) => {
      await queue.send(tx, "photo.cleanup", { requestId: MARK });
      throw new Error("the row could not be written");
    });
    await expect(attempt).rejects.toThrow("the row could not be written");
    expect(await jobs()).toBe(0);
  });

  it("is there when the transaction commits", async () => {
    await harness.db.transaction(async (tx) => {
      await queue.send(tx, "photo.cleanup", { requestId: MARK });
    });
    expect(await jobs()).toBe(1);
  });
});

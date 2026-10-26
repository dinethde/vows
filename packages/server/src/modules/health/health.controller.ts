import { Controller, Get, Inject, Res } from "@nestjs/common";
import { sql } from "drizzle-orm";
import type { Response } from "express";

import type { Db } from "@vows/db";

import { DB } from "../../database/database.module";
import { QueueService } from "../../queue/queue.service";
import { StorageService } from "../../storage/storage.service";

type Check = "ok" | "down";

async function check(probe: () => Promise<unknown>): Promise<Check> {
  try {
    await probe();
    return "ok";
  } catch {
    return "down";
  }
}

@Controller()
export class HealthController {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly storage: StorageService,
    private readonly queue: QueueService,
  ) {}

  /** The process is alive. It touches nothing, so a database blip cannot restart a healthy machine. */
  @Get("healthz")
  healthz(): { status: "ok" } {
    return { status: "ok" };
  }

  /** Every dependency answers, each one reported. 503 holds traffic off this machine. */
  @Get("readyz")
  async readyz(@Res({ passthrough: true }) response: Response): Promise<Record<string, Check>> {
    const [postgres, r2, queue] = await Promise.all([
      check(() => this.db.execute(sql`select 1`)),
      check(() => this.storage.ping()),
      check(() => this.queue.ping()),
    ]);
    const checks = { postgres, r2, queue };
    if (Object.values(checks).includes("down")) response.status(503);
    return checks;
  }
}

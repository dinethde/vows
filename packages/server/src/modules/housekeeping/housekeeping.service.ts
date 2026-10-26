import { Inject, Injectable } from "@nestjs/common";
import { enquiry, photoDerivative } from "@vows/db";
import type { Db } from "@vows/db";
import { lt } from "drizzle-orm";

import { LOGGER } from "../../common/logger";
import type { Logger } from "../../common/logger";
import { DB } from "../../database/database.module";
import { StorageService } from "../../storage/storage.service";

/** The privacy page promises twenty-four months. This is where it is kept. */
export const ENQUIRY_RETENTION_MONTHS = 24;
export const ORPHAN_ALERT_AT = 50;

export interface OrphanReport {
  filesWithNoRow: number;
  rowsWithNoFile: number;
}

@Injectable()
export class HousekeepingService {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(LOGGER) private readonly log: Logger,
    private readonly storage: StorageService,
  ) {}

  async deleteOldEnquiries(now = new Date()): Promise<number> {
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - ENQUIRY_RETENTION_MONTHS);
    const gone = await this.db
      .delete(enquiry)
      .where(lt(enquiry.createdAt, cutoff))
      .returning({ id: enquiry.id });
    return gone.length;
  }

  /**
   * Compares the public bucket with the derivative table and reports the two
   * differences. It deletes nothing: a sweep that removes what it does not
   * understand is how photographs disappear.
   */
  async countOrphans(): Promise<OrphanReport> {
    const [keys, rows] = await Promise.all([
      this.storage.listPublic("d/"),
      this.db.select({ key: photoDerivative.key }).from(photoDerivative),
    ]);
    const stored = new Set(keys);
    const known = new Set(rows.map((row) => row.key));
    const report = {
      filesWithNoRow: keys.filter((key) => !known.has(key)).length,
      rowsWithNoFile: rows.filter((row) => !stored.has(row.key)).length,
    };
    const loud = report.filesWithNoRow > ORPHAN_ALERT_AT || report.rowsWithNoFile > ORPHAN_ALERT_AT;
    this.log[loud ? "error" : "info"](report, "orphan sweep");
    return report;
  }
}

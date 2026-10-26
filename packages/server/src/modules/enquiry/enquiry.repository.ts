import { Inject, Injectable } from "@nestjs/common";
import type { EnquiryStatus } from "@vows/contracts";
import { enquiry, newId } from "@vows/db";
import type { Db, DbOrTx } from "@vows/db";
import { and, desc, eq, gte, lt, or, sql } from "drizzle-orm";

import type { Cursor } from "../../common/cursor";
import { DB } from "../../database/database.module";

export type EnquiryRow = typeof enquiry.$inferSelect;
export type NewEnquiry = Omit<
  typeof enquiry.$inferInsert,
  "id" | "status" | "createdAt" | "updatedAt"
>;

@Injectable()
export class EnquiryRepository {
  constructor(@Inject(DB) private readonly db: Db) {}

  /** Holds every other enquiry from this address until the transaction ends. */
  async lockEmail(tx: DbOrTx, email: string): Promise<void> {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${email}))`);
  }

  /** One sender at a time, so a burst cannot all count the same hour at once. */
  async lockSender(tx: DbOrTx, ipHash: string): Promise<void> {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`ip:${ipHash}`}))`);
  }

  async countFromIpSince(tx: DbOrTx, ipHash: string, since: Date): Promise<number> {
    return tx.$count(enquiry, and(eq(enquiry.ipHash, ipHash), gte(enquiry.createdAt, since)));
  }

  async findRecentCopy(
    tx: DbOrTx,
    email: string,
    notes: string | null,
    since: Date,
  ): Promise<EnquiryRow | undefined> {
    const [row] = await tx
      .select()
      .from(enquiry)
      .where(
        and(
          eq(enquiry.email, email),
          gte(enquiry.createdAt, since),
          sql`coalesce(${enquiry.notes}, '') = ${notes ?? ""}`,
        ),
      )
      .orderBy(desc(enquiry.createdAt))
      .limit(1);
    return row;
  }

  async insert(tx: DbOrTx, values: NewEnquiry): Promise<EnquiryRow> {
    const [row] = await tx
      .insert(enquiry)
      .values({ ...values, id: newId("enquiry") })
      .returning();
    if (!row) throw new Error("The enquiry insert returned no row.");
    return row;
  }

  async list(
    status: EnquiryStatus | undefined,
    limit: number,
    after?: Cursor,
  ): Promise<EnquiryRow[]> {
    const page = after
      ? or(
          lt(enquiry.createdAt, after.createdAt),
          and(eq(enquiry.createdAt, after.createdAt), lt(enquiry.id, after.id)),
        )
      : undefined;
    return this.db
      .select()
      .from(enquiry)
      .where(and(status ? eq(enquiry.status, status) : undefined, page))
      .orderBy(desc(enquiry.createdAt), desc(enquiry.id))
      .limit(limit);
  }

  async setStatus(tx: DbOrTx, id: string, status: EnquiryStatus): Promise<EnquiryRow | undefined> {
    const [row] = await tx.update(enquiry).set({ status }).where(eq(enquiry.id, id)).returning();
    return row;
  }
}

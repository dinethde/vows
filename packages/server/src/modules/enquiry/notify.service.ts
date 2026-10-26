import { Inject, Injectable } from "@nestjs/common";
import { enquiry, setting } from "@vows/db";
import type { Db } from "@vows/db";
import { createMailer, renderEnquiryNotify, renderEnquiryReceived } from "@vows/mail";
import type { Mailer } from "@vows/mail";
import { eq, inArray } from "drizzle-orm";

import { colomboTime, fullDate } from "../../common/dates";
import { ENV } from "../../config/env";
import type { Env } from "../../config/env";
import { DB } from "../../database/database.module";

export const MAILER = Symbol("MAILER");
const FALLBACK = { notifyEmail: "info.vowslk@gmail.com", phone: "+94 71 657 0999" };

export function mailerFrom(env: Env): Mailer | null {
  return env.RESEND_API_KEY && env.MAIL_FROM
    ? createMailer({ apiKey: env.RESEND_API_KEY, from: env.MAIL_FROM })
    : null;
}

/**
 * The two emails an enquiry sends. Each carries a key made from the enquiry id,
 * so a second run of the job sends nothing twice.
 */
@Injectable()
export class NotifyService {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(ENV) private readonly env: Env,
    @Inject(MAILER) private readonly mailer: Mailer | null,
  ) {}

  async send(enquiryId: string): Promise<void> {
    const row = await this.db.query.enquiry.findFirst({ where: eq(enquiry.id, enquiryId) });
    // Removed since it was queued. There is nobody left to write to.
    if (!row) return;
    if (!this.mailer)
      throw new Error("RESEND_API_KEY and MAIL_FROM are not set, so no email can be sent.");

    const studio = await this.studioDetails();
    const [notification, reply] = await Promise.all([
      renderEnquiryNotify({
        name: row.name,
        email: row.email,
        phone: row.phone,
        weddingDate: row.weddingDate ? fullDate(row.weddingDate) : null,
        weddingPlace: row.weddingPlace,
        notes: row.notes,
        receivedAt: colomboTime(row.createdAt),
        // The enquiry inbox has no design yet, so the link opens the Studio.
        studioUrl: `${this.env.SITE_URL.replace(/\/$/, "")}/studio`,
      }),
      renderEnquiryReceived({ name: row.name, phone: studio.phone }),
    ]);

    await this.mailer.send(studio.notifyEmail, notification, `enquiry-notify/${row.id}`);
    await this.mailer.send(row.email, reply, `enquiry-received/${row.id}`);
  }

  private async studioDetails(): Promise<typeof FALLBACK> {
    const rows = await this.db
      .select()
      .from(setting)
      .where(inArray(setting.key, ["notifyEmail", "phone"]));
    const read = (key: keyof typeof FALLBACK): string => {
      const value = rows.find((row) => row.key === key)?.value;
      return typeof value === "string" && value ? value : FALLBACK[key];
    };
    return { notifyEmail: read("notifyEmail"), phone: read("phone") };
  }
}

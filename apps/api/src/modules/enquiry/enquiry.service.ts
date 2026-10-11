import { createHash } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { MIN_FORM_OPEN_MS } from '@vows/contracts';
import type {
  CreateEnquiry,
  Enquiry,
  EnquiryList,
  EnquiryListQuery,
  EnquiryStatus,
} from '@vows/contracts';
import type { Db } from '@vows/db';

import { decodeCursor, encodeCursor } from '../../common/cursor';
import { NotFoundError, RateLimitedError, ValidationError } from '../../common/errors/domain-error';
import type { Actor } from '../../common/request';
import { ENV } from '../../config/env';
import type { Env } from '../../config/env';
import { DB } from '../../database/database.module';
import { QueueService } from '../../queue/queue.service';
import { AuditService } from '../audit/audit.service';

import { EnquiryRepository } from './enquiry.repository';
import type { EnquiryRow } from './enquiry.repository';

export const ENQUIRIES_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
const USER_AGENT_MAX = 255;

export interface Sender {
  ip: string;
  userAgent: string | undefined;
  requestId: string;
}

function toEnquiry(row: EnquiryRow): Enquiry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    weddingDate: row.weddingDate,
    weddingPlace: row.weddingPlace,
    notes: row.notes,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class EnquiryService {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(ENV) private readonly env: Env,
    private readonly repo: EnquiryRepository,
    private readonly queue: QueueService,
    private readonly audit: AuditService,
  ) {}

  /**
   * The only write a stranger can make. The row and its notification job are
   * one transaction, so the enquiry is safe the moment this returns and the
   * email can be late without anyone losing a message.
   */
  async create(input: CreateEnquiry, sender: Sender, now = new Date()): Promise<{ id: string }> {
    if (now.getTime() - input.openedAt < MIN_FORM_OPEN_MS) {
      throw new ValidationError({ form: 'That was sent too quickly. Please try again.' });
    }
    const ipHash = createHash('sha256')
      .update(`${this.env.IP_HASH_SALT}:${sender.ip}`)
      .digest('hex');
    const notes = input.notes ?? null;

    return this.db.transaction(async (tx) => {
      await this.repo.lockEmail(tx, input.email);

      // The same message again within ten minutes is a lost reply being
      // retried, not a second enquiry. Days later it is a real follow-up.
      const since = new Date(now.getTime() - DUPLICATE_WINDOW_MS);
      const copy = await this.repo.findRecentCopy(tx, input.email, notes, since);
      if (copy) return { id: copy.id };

      const recent = await this.repo.countFromIpSince(
        tx,
        ipHash,
        new Date(now.getTime() - HOUR_MS),
      );
      if (recent >= ENQUIRIES_PER_HOUR) {
        throw new RateLimitedError(
          'We have had several messages from this connection in the last hour. Please email info.vowslk@gmail.com instead.',
          HOUR_MS / 1000,
        );
      }

      const row = await this.repo.insert(tx, {
        name: input.name,
        email: input.email,
        phone: input.phone,
        weddingDate: input.weddingDate,
        weddingPlace: input.weddingPlace ?? null,
        notes,
        ipHash,
        userAgent: sender.userAgent?.slice(0, USER_AGENT_MAX) ?? null,
      });
      await this.queue.send(tx, 'enquiry.notify', {
        enquiryId: row.id,
        requestId: sender.requestId,
      });
      return { id: row.id };
    });
  }

  async list(query: EnquiryListQuery): Promise<EnquiryList> {
    const after = query.cursor ? decodeCursor(query.cursor) : undefined;
    const rows = await this.repo.list(query.status, query.limit + 1, after);
    const page = rows.slice(0, query.limit);
    const last = page.at(-1);
    return {
      data: page.map(toEnquiry),
      nextCursor: rows.length > query.limit && last ? encodeCursor(last) : null,
    };
  }

  async setStatus(id: string, status: EnquiryStatus, actor: Actor): Promise<Enquiry> {
    return this.db.transaction(async (tx) => {
      const row = await this.repo.setStatus(tx, id, status);
      if (!row) throw new NotFoundError('enquiry_not_found', 'We could not find that enquiry.');
      await this.audit.record(tx, actor, {
        action: 'enquiry.status',
        entity: 'enquiry',
        entityId: id,
        diff: { status },
      });
      return toEnquiry(row);
    });
  }
}

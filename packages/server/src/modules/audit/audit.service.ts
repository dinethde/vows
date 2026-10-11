import { Injectable } from '@nestjs/common';
import { auditLog, newId } from '@vows/db';
import type { Tx } from '@vows/db';

import type { Actor } from '../../common/request';

export interface AuditEntry {
  action: string;
  entity: 'album' | 'photo' | 'enquiry' | 'setting';
  entityId: string;
  diff?: Record<string, unknown>;
}

/** Append only. Written inside the transaction that made the change. */
@Injectable()
export class AuditService {
  async record(tx: Tx, actor: Actor, entry: AuditEntry): Promise<void> {
    await tx.insert(auditLog).values({
      id: newId('audit'),
      actorClerkId: actor.clerkId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      diff: entry.diff ?? null,
    });
  }
}

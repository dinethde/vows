import { Inject, Injectable } from '@nestjs/common';
import type { OnApplicationShutdown } from '@nestjs/common';
import { JOBS } from '@vows/contracts';
import type { JobName, JobPayload } from '@vows/contracts';
import type { Tx } from '@vows/db';
import { sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import PgBoss from 'pg-boss';

import { ENV } from '../config/env';
import type { Env } from '../config/env';

import { CRON_TIMEZONE, QUEUES, RETRY_DELAY_SECONDS } from './catalogue';

/** pg-boss writes `$1`; Drizzle wants its own parameters. Same query, same values. */
function toDrizzle(text: string, values: unknown[] = []): SQL {
  const parts = text.split(/\$(\d+)/);
  return sql.join(
    parts.map((part, index) =>
      index % 2 === 0 ? sql.raw(part) : sql.param(values[Number(part) - 1]),
    ),
  );
}

/**
 * The one place that talks to pg-boss. `send` takes the caller's transaction,
 * so a job and the row it refers to are written together or not at all.
 */
@Injectable()
export class QueueService implements OnApplicationShutdown {
  readonly boss: PgBoss;
  private started = false;

  constructor(@Inject(ENV) env: Env) {
    this.boss = new PgBoss({ connectionString: env.DATABASE_URL, schema: 'pgboss', max: 2 });
  }

  /** Creates the schema and the queues on first run. Safe to call twice. */
  async start(): Promise<void> {
    if (this.started) return;
    await this.boss.start();
    for (const [name, options] of Object.entries(QUEUES)) {
      await this.boss.createQueue(name, {
        name,
        retryLimit: options.retryLimit,
        retryDelay: RETRY_DELAY_SECONDS,
        retryBackoff: true,
        expireInSeconds: options.expireInSeconds,
      });
      if (options.cron) await this.boss.schedule(name, options.cron, {}, { tz: CRON_TIMEZONE });
    }
    this.started = true;
  }

  get isStarted(): boolean {
    return this.started;
  }

  async send<Name extends JobName>(tx: Tx, name: Name, payload: JobPayload<Name>): Promise<void> {
    const data = JOBS[name].parse(payload) as object;
    await this.boss.send(name, data, {
      db: { executeSql: (text: string, values?: unknown[]) => tx.execute(toDrizzle(text, values)) },
    });
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.started) await this.boss.stop({ graceful: true, timeout: 30_000 });
  }
}

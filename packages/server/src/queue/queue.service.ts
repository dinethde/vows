import { Inject, Injectable } from '@nestjs/common';
import type { OnApplicationShutdown } from '@nestjs/common';
import { JOBS } from '@vows/contracts';
import type { JobName, JobPayload } from '@vows/contracts';
import type { Db, Tx } from '@vows/db';
import { sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import PgBoss from 'pg-boss';

import { PermanentJobError } from '../common/errors/domain-error';
import { LOGGER } from '../common/logger';
import type { Logger } from '../common/logger';
import { ENV } from '../config/env';
import type { Env } from '../config/env';
import { DB } from '../database/database.module';

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

export interface JobAttempt {
  jobId: string;
  /** True when a failure now is final: pg-boss will not run the job again. */
  last: boolean;
}

/**
 * The one place that talks to pg-boss. `send` takes the caller's transaction,
 * so a job and the row it refers to are written together or not at all.
 */
@Injectable()
export class QueueService implements OnApplicationShutdown {
  readonly boss: PgBoss;
  private started = false;

  constructor(
    @Inject(ENV) env: Env,
    @Inject(DB) private readonly db: Db,
    @Inject(LOGGER) private readonly log: Logger,
  ) {
    this.boss = new PgBoss({ connectionString: env.DATABASE_URL, schema: 'pgboss', max: 2 });
    // pg-boss emits `error` from its own timers. With no listener Node treats
    // that as an uncaught exception, so one failed DNS lookup would end the
    // process. It retries on its next tick; `/readyz` reports the outage.
    this.boss.on('error', (error) => {
      this.log.error({ err: error }, 'queue error');
    });
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

  /**
   * Registers a handler. Throwing is how a handler fails: pg-boss retries with
   * a growing gap. A PermanentJobError spends the retries first, so a file that
   * is not an image is not tried four more times.
   */
  async work<Name extends JobName>(
    name: Name,
    handler: (payload: JobPayload<Name>, attempt: JobAttempt) => Promise<void>,
  ): Promise<void> {
    for (let slot = 0; slot < QUEUES[name].concurrency; slot += 1) {
      const options = { batchSize: 1, includeMetadata: true as const };
      await this.boss.work(name, options, async ([job]) => {
        if (!job) return;
        const attempt = { jobId: job.id, last: job.retryCount >= job.retryLimit };
        const context = { job: name, jobId: job.id, ...(job.data as object) };
        this.log.info(context, 'job started');
        try {
          const payload = JOBS[name].safeParse(job.data);
          if (!payload.success)
            throw new PermanentJobError('The payload does not match its schema.');
          await handler(payload.data as JobPayload<Name>, attempt);
          this.log.info(context, 'job finished');
        } catch (error) {
          if (error instanceof PermanentJobError) await this.stopRetrying(job.id);
          this.log.warn({ ...context, err: error }, 'job failed');
          throw error;
        }
      });
    }
  }

  private async stopRetrying(jobId: string): Promise<void> {
    await this.db.execute(sql`update pgboss.job set retry_limit = retry_count where id = ${jobId}`);
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.started) await this.boss.stop({ graceful: true, timeout: 30_000 });
  }
}

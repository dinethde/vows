import { spawn } from 'node:child_process';

import { Inject, Injectable } from '@nestjs/common';

import { ENV } from '../../config/env';
import type { Env } from '../../config/env';
import { StorageService } from '../../storage/storage.service';

/** Two months of Sundays. */
export const BACKUPS_KEPT = 8;

/** The dumps to delete: everything but the newest eight. Names sort by date. */
export function expired(keys: string[], keep = BACKUPS_KEPT): string[] {
  return [...keys].sort().slice(0, Math.max(0, keys.length - keep));
}

/**
 * Every table, in pg_dump's compressed custom format. The URL goes in through
 * the environment, not the arguments, so it never shows in a process list.
 */
function dump(databaseUrl: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const url = new URL(databaseUrl);
    const child = spawn('pg_dump', ['--format=custom', '--no-owner', '--no-privileges'], {
      env: {
        PATH: process.env.PATH ?? '',
        PGHOST: url.hostname,
        PGPORT: url.port || '5432',
        PGUSER: decodeURIComponent(url.username),
        PGPASSWORD: decodeURIComponent(url.password),
        PGDATABASE: url.pathname.slice(1),
        PGSSLMODE: 'require',
      },
    });
    const chunks: Buffer[] = [];
    let failure = '';
    child.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => (failure += chunk.toString()));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(Buffer.concat(chunks));
      else reject(new Error(`pg_dump exited with ${String(code)}: ${failure.slice(0, 300)}`));
    });
  });
}

/** The database, once a week, somewhere that is not Neon. Not the photographs. */
@Injectable()
export class BackupService {
  constructor(
    @Inject(ENV) private readonly env: Env,
    private readonly storage: StorageService,
  ) {}

  async run(now = new Date()): Promise<{ key: string; bytes: number }> {
    const { DATABASE_URL_UNPOOLED: url, R2_BUCKET_BACKUPS: bucket } = this.env;
    if (!url || !bucket)
      throw new Error('DATABASE_URL_UNPOOLED and R2_BUCKET_BACKUPS are not set.');

    const body = await dump(url);
    // One file per day: a second run the same day overwrites the first.
    const key = `backups/${now.toISOString().slice(0, 10)}.dump`;
    await this.storage.writeBackup(bucket, key, body);
    await this.storage.deleteBackups(bucket, expired(await this.storage.listBackups(bucket)));
    return { key, bytes: body.length };
  }
}

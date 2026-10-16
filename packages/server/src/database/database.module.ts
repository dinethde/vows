import { Global, Inject, Injectable, Module } from '@nestjs/common';
import type { OnApplicationShutdown } from '@nestjs/common';
import { createDatabase } from '@vows/db';
import type { Database, Db } from '@vows/db';

import { ENV } from '../config/env';
import type { Env } from '../config/env';

export const DB = Symbol('DB');
const DATABASE = Symbol('DATABASE');

@Injectable()
class DatabaseLifecycle implements OnApplicationShutdown {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async onApplicationShutdown(): Promise<void> {
    await this.database.pool.end();
  }
}

/** One pool for the process. Services ask for DB; nothing else reads the URL. */
@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      inject: [ENV],
      useFactory: (env: Env): Database => createDatabase(env.DATABASE_URL),
    },
    { provide: DB, inject: [DATABASE], useFactory: (database: Database): Db => database.db },
    DatabaseLifecycle,
  ],
  exports: [DB],
})
export class DatabaseModule {}

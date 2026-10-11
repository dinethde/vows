import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

export type Db = NodePgDatabase<typeof schema>;
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
/** A repository method takes either, so it can join a transaction or run alone. */
export type DbOrTx = Db | Tx;

export interface Database {
  db: Db;
  pool: Pool;
}

/**
 * The one place a pool is created. It is kept small and lets idle connections
 * go, because an open connection is what keeps Neon's compute awake.
 */
export function createDatabase(connectionString: string, max = 5): Database {
  const pool = new Pool({ connectionString, max, idleTimeoutMillis: 10_000 });
  return { db: drizzle(pool, { schema }), pool };
}

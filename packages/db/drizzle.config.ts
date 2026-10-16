import { defineConfig } from 'drizzle-kit';

/**
 * DATABASE_URL must point at a personal Neon branch during development.
 * Running `db:migrate` against the production branch by hand is forbidden —
 * migrations reach production through the deploy workflow only. See chapter 11.
 */
const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');
if (process.env.ALLOW_PROD_MIGRATE !== 'yes' && /ep-.*-prod/.test(url)) {
  throw new Error('refusing to run against the production branch');
}

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: { url },
  strict: true,
  verbose: true,
});

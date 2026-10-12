import { z } from 'zod';

/**
 * The only file that reads process.env. It parses at boot and throws before
 * anything listens, so a missing variable is a crash in the first second.
 */
const fields = z.object({
  /** Which of the two processes this is. The worker says so before it starts. */
  VOWS_SERVICE: z.enum(['api', 'worker']).default('api'),
  APP_ENV: z.enum(['local', 'preview', 'staging', 'production']),
  PORT: z.coerce.number().int().default(3001),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  DATABASE_URL: z.string().url(),
  CLERK_ISSUER: z.string().url(),
  CLERK_JWKS_URL: z.string().url(),
  /** Our own web origins. A token minted for any other app is refused. */
  WEB_ORIGINS: z
    .string()
    .min(1)
    .transform((value) => value.split(',').map((origin) => origin.trim())),
  SITE_URL: z.string().url(),
  MEDIA_URL: z.string().url(),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_ORIGINALS: z.string().min(1),
  R2_BUCKET_PUBLIC: z.string().min(1),
  REVALIDATE_SECRET: z.string().min(32),
  IP_HASH_SALT: z.string().min(16),
  /** Worker only. db.backup needs a direct connection and somewhere to put the dump. */
  DATABASE_URL_UNPOOLED: z.string().url().optional(),
  R2_BUCKET_BACKUPS: z.string().min(1).optional(),
  /** Worker only. Without them enquiry.notify fails and retries, and says why. */
  RESEND_API_KEY: z.string().min(1).optional(),
  MAIL_FROM: z.string().min(3).optional(),
  SENTRY_DSN: z.string().url().optional(),
  /** Passed on to pg_dump, which has to be found somewhere. */
  PATH: z.string().default(''),
});

const WORKER_ONLY = [
  'DATABASE_URL_UNPOOLED',
  'R2_BUCKET_BACKUPS',
  'RESEND_API_KEY',
  'MAIL_FROM',
] as const;

/**
 * A deployed worker cannot do its job without these four, so it refuses to
 * start without them. On a laptop or a preview they stay optional: a backup
 * or an email there fails when it runs, and says why.
 */
const schema = fields.superRefine((env, context) => {
  const deployed = env.APP_ENV === 'staging' || env.APP_ENV === 'production';
  if (env.VOWS_SERVICE !== 'worker' || !deployed) return;
  for (const name of WORKER_ONLY) {
    if (!env[name]) context.addIssue({ code: 'custom', path: [name], message: 'Required' });
  }
});

export type Env = z.infer<typeof schema>;

export function parseEnv(source: NodeJS.ProcessEnv): Env {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const missing = Object.keys(parsed.error.flatten().fieldErrors).join(', ');
    throw new Error(`Invalid environment. Refusing to start. Check: ${missing}`);
  }
  return parsed.data;
}

/** The worker's one line of configuration, kept here with the rest of it. */
export function declareService(name: Env['VOWS_SERVICE']): void {
  process.env.VOWS_SERVICE = name;
}

export const ENV = Symbol('ENV');

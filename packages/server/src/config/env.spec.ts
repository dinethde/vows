import { describe, expect, it } from 'vitest';

import { parseEnv } from './env';

const BASE = {
  APP_ENV: 'staging',
  DATABASE_URL: 'postgres://user:pw@db.example.com/vows',
  CLERK_ISSUER: 'https://clerk.example.com',
  CLERK_JWKS_URL: 'https://clerk.example.com/.well-known/jwks.json',
  WEB_ORIGINS: 'https://staging.example.com',
  SITE_URL: 'https://staging.example.com',
  MEDIA_URL: 'https://media.example.com',
  R2_ACCOUNT_ID: 'account',
  R2_ACCESS_KEY_ID: 'key',
  R2_SECRET_ACCESS_KEY: 'secret',
  R2_BUCKET_ORIGINALS: 'originals',
  R2_BUCKET_PUBLIC: 'media',
  REVALIDATE_SECRET: 'x'.repeat(32),
  IP_HASH_SALT: 'y'.repeat(16),
};
const WORKER = {
  DATABASE_URL_UNPOOLED: 'postgres://user:pw@direct.example.com/vows',
  R2_BUCKET_BACKUPS: 'backups',
  RESEND_API_KEY: 'key',
  MAIL_FROM: 'Vows <hello@example.com>',
};

describe('the environment, read once at start', () => {
  it('lets the API start without the worker’s four variables', () => {
    expect(parseEnv(BASE).VOWS_SERVICE).toBe('api');
  });

  it('refuses to start a deployed worker that cannot back up or send mail', () => {
    expect(() => parseEnv({ ...BASE, VOWS_SERVICE: 'worker' })).toThrow(
      'DATABASE_URL_UNPOOLED, R2_BUCKET_BACKUPS, RESEND_API_KEY, MAIL_FROM',
    );
    expect(parseEnv({ ...BASE, ...WORKER, VOWS_SERVICE: 'worker' }).MAIL_FROM).toBe(
      WORKER.MAIL_FROM,
    );
  });

  it('lets a worker on a laptop start without them', () => {
    expect(parseEnv({ ...BASE, APP_ENV: 'local', VOWS_SERVICE: 'worker' }).APP_ENV).toBe('local');
  });

  it('names what is missing and never prints a value', () => {
    const { DATABASE_URL: _omitted, ...rest } = BASE;
    expect(() => parseEnv(rest)).toThrow('Check: DATABASE_URL');
  });
});

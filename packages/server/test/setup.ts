/**
 * Values for a test run. None is a real secret: the two that look like one are
 * fixed strings, and the database URL comes from the shell that started the run.
 */
const DEFAULTS: Record<string, string> = {
  APP_ENV: "local",
  LOG_LEVEL: "error",
  CLERK_ISSUER: "https://clerk.test.vows.lk",
  CLERK_JWKS_URL: "https://clerk.test.vows.lk/.well-known/jwks.json",
  WEB_ORIGINS: "http://localhost:3000",
  SITE_URL: "http://localhost:3000",
  MEDIA_URL: "https://media.test.vows.lk",
  R2_ACCOUNT_ID: "test",
  R2_ACCESS_KEY_ID: "test",
  R2_SECRET_ACCESS_KEY: "test",
  R2_BUCKET_ORIGINALS: "vows-originals-test",
  R2_BUCKET_PUBLIC: "vows-media-test",
  REVALIDATE_SECRET: "test-only-revalidate-value-0123456789",
  IP_HASH_SALT: "test-only-salt-0123",
};

for (const [name, value] of Object.entries(DEFAULTS)) process.env[name] ??= value;

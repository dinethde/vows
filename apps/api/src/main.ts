import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule, configure, LOGGER } from '@vows/server';
import type { Logger } from '@vows/server';

/** The HTTP entry point. Everything it serves lives in @vows/server. */
async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
  const env = await configure(app);
  await app.listen(env.PORT, '0.0.0.0');
  app.get<Logger>(LOGGER).info({ port: env.PORT }, 'api listening');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule, LOGGER, QueueService } from '@vows/server';
import type { Logger } from '@vows/server';

import { photoDerive } from './jobs/photo-derive/handler';

/**
 * The same application as the API, with no HTTP listener. It starts the queue,
 * registers a handler per job, and on SIGTERM finishes what it holds.
 */
async function main(): Promise<void> {
  process.env.VOWS_SERVICE = 'worker';
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  app.enableShutdownHooks();

  const queue = app.get(QueueService);
  await queue.start();
  await queue.work('photo.derive', photoDerive(app));

  app.get<Logger>(LOGGER).info('worker started');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

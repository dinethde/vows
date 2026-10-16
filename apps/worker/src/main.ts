import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  AppModule,
  declareService,
  ENV,
  LOGGER,
  QueueService,
  startErrorReporting,
} from '@vows/server';
import type { Env, Logger } from '@vows/server';

import { albumRevalidate } from './jobs/album-revalidate/handler';
import { albumSitemap } from './jobs/album-sitemap/handler';
import { dbBackup } from './jobs/db-backup/handler';
import { enquiryNotify } from './jobs/enquiry-notify/handler';
import { housekeepingArchive } from './jobs/housekeeping-archive/handler';
import { housekeepingOrphans } from './jobs/housekeeping-orphans/handler';
import { photoCleanup } from './jobs/photo-cleanup/handler';
import { photoDerive } from './jobs/photo-derive/handler';

/**
 * The same application as the API, with no HTTP listener. It starts the queue,
 * registers a handler per job, and on SIGTERM finishes what it holds.
 */
async function main(): Promise<void> {
  declareService('worker');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  app.enableShutdownHooks();
  startErrorReporting(app.get<Env>(ENV));

  const queue = app.get(QueueService);
  await queue.start();
  await queue.work('photo.derive', photoDerive(app));
  await queue.work('album.revalidate', albumRevalidate(app));
  await queue.work('enquiry.notify', enquiryNotify(app));
  await queue.work('photo.cleanup', photoCleanup(app));
  await queue.work('album.sitemap', albumSitemap(app));
  await queue.work('housekeeping.archive', housekeepingArchive(app));
  await queue.work('housekeeping.orphans', housekeepingOrphans(app));
  await queue.work('db.backup', dbBackup(app));

  app.get<Logger>(LOGGER).info('worker started');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

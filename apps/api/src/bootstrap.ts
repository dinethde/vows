import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { DomainExceptionFilter } from './common/filters/http.filter';
import { attachRequestId } from './common/interceptors/request.interceptor';
import { LOGGER } from './common/logger';
import type { Logger } from './common/logger';
import { ENV } from './config/env';
import type { Env } from './config/env';
import { QueueService } from './queue/queue.service';

/** Everything main.ts and the tests both need, so a test runs the real pipeline. */
export async function configure(app: INestApplication): Promise<Env> {
  const env = app.get<Env>(ENV);
  const express = app as NestExpressApplication;

  // Fly and Cloudflare sit in front, so the client address is in a header.
  express.set('trust proxy', true);
  express.disable('x-powered-by');
  app.use(attachRequestId);
  app.useGlobalFilters(new DomainExceptionFilter(app.get<Logger>(LOGGER)));
  app.enableCors({
    origin: env.WEB_ORIGINS,
    allowedHeaders: ['authorization', 'content-type', 'idempotency-key', 'x-request-id'],
    exposedHeaders: ['x-request-id'],
  });
  app.enableShutdownHooks();
  await app.get(QueueService).start();
  return env;
}

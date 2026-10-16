import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { DomainExceptionFilter } from './common/filters/http.filter';
import { attachRequestId } from './common/interceptors/request.interceptor';
import { LOGGER } from './common/logger';
import type { Logger } from './common/logger';
import { ENV } from './config/env';
import type { Env } from './config/env';
import { startErrorReporting } from './observability/error-reporting';
import { QueueService } from './queue/queue.service';

/** Everything main.ts and the tests both need, so a test runs the real pipeline. */
export async function configure(app: INestApplication): Promise<Env> {
  const env = app.get<Env>(ENV);
  startErrorReporting(env);
  const express = app as NestExpressApplication;

  // One proxy sits in front: Fly's. It appends the address that connected to
  // it, so that last entry is the one to believe. Trusting the whole header
  // would let a caller write their own address at its start.
  express.set('trust proxy', 1);
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

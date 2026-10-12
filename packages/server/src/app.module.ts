import { Global, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { createRemoteJWKSet } from 'jose';
import type { JWTVerifyGetKey } from 'jose';

import { ClerkGuard, JWKS } from './common/guards/clerk.guard';
import { RequestLogInterceptor } from './common/interceptors/request.interceptor';
import { createLogger, LOGGER } from './common/logger';
import type { Logger } from './common/logger';
import { ENV, parseEnv } from './config/env';
import type { Env } from './config/env';
import { DatabaseModule } from './database/database.module';
import { AlbumModule } from './modules/album/album.module';
import { AuditModule } from './modules/audit/audit.module';
import { BackupModule } from './modules/backup/backup.module';
import { EnquiryModule } from './modules/enquiry/enquiry.module';
import { HealthModule } from './modules/health/health.module';
import { HousekeepingModule } from './modules/housekeeping/housekeeping.module';
import { PhotoModule } from './modules/photo/photo.module';
import { RevalidateModule } from './modules/revalidate/revalidate.module';
import { QueueModule } from './queue/queue.module';
import { StorageModule } from './storage/storage.module';

/** The few things every module needs: the parsed environment, the logger, Clerk's keys. */
@Global()
@Module({
  providers: [
    { provide: ENV, useFactory: (): Env => parseEnv(process.env) },
    {
      provide: LOGGER,
      inject: [ENV],
      useFactory: (env: Env): Logger => createLogger(env.VOWS_SERVICE, env.APP_ENV, env.LOG_LEVEL),
    },
    {
      // Cached, and refetched once when a token names a key we have not seen.
      provide: JWKS,
      inject: [ENV],
      useFactory: (env: Env): JWTVerifyGetKey => createRemoteJWKSet(new URL(env.CLERK_JWKS_URL)),
    },
  ],
  exports: [ENV, LOGGER, JWKS],
})
export class CoreModule {}

@Module({
  imports: [
    CoreModule,
    DatabaseModule,
    QueueModule,
    StorageModule,
    AuditModule,
    HealthModule,
    EnquiryModule,
    AlbumModule,
    PhotoModule,
    HousekeepingModule,
    RevalidateModule,
    BackupModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ClerkGuard },
    { provide: APP_INTERCEPTOR, useClass: RequestLogInterceptor },
  ],
})
export class AppModule {}

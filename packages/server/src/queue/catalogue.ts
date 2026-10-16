import type { JobName } from '@vows/contracts';

export interface QueueOptions {
  retryLimit: number;
  expireInSeconds: number;
  /** How many of this job one worker runs at once. */
  concurrency: number;
  /** A cron line in Asia/Colombo, for the jobs nobody enqueues. */
  cron?: string;
}

/** Chapter 11's catalogue. A queue that is not here does not exist. */
export const QUEUES: Record<JobName, QueueOptions> = {
  // One at a time. A derive needs about 385 MB above the process whatever the
  // photograph's size (the AVIF encoder at 2400 px), so three at once do not
  // fit the worker's 1 GB. Measured 2026-10-17; see docs/progress.md.
  'photo.derive': { retryLimit: 3, expireInSeconds: 300, concurrency: 1 },
  'album.revalidate': { retryLimit: 5, expireInSeconds: 30, concurrency: 1 },
  'enquiry.notify': { retryLimit: 5, expireInSeconds: 30, concurrency: 2 },
  'photo.cleanup': { retryLimit: 3, expireInSeconds: 120, concurrency: 1 },
  'album.sitemap': { retryLimit: 2, expireInSeconds: 60, concurrency: 1, cron: '0 3 * * *' },
  'housekeeping.archive': {
    retryLimit: 1,
    expireInSeconds: 60,
    concurrency: 1,
    cron: '30 3 * * *',
  },
  'housekeeping.orphans': {
    retryLimit: 1,
    expireInSeconds: 600,
    concurrency: 1,
    cron: '0 4 * * 0',
  },
  'db.backup': { retryLimit: 2, expireInSeconds: 900, concurrency: 1, cron: '0 2 * * 0' },
};

export const CRON_TIMEZONE = 'Asia/Colombo';
/** 30 s, then 2 m, 8 m, 32 m: pg-boss doubles the delay and adds jitter. */
export const RETRY_DELAY_SECONDS = 30;

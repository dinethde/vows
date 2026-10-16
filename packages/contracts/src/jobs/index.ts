import { z } from 'zod';

import { albumId, enquiryId, photoId, slug } from '../shared/ids';

/** A payload carries ids, never objects, plus the request that caused it. */
const requestId = z.string().optional();
const scheduled = z.object({}).passthrough();

export const JOBS = {
  'photo.derive': z.object({ photoId, requestId }),
  'album.revalidate': z.object({ albumId, slug, oldSlug: slug.optional(), requestId }),
  'enquiry.notify': z.object({ enquiryId, requestId }),
  'photo.cleanup': z.object({ albumId: albumId.optional(), requestId }),
  'album.sitemap': scheduled,
  'housekeeping.archive': scheduled,
  'housekeeping.orphans': scheduled,
  'db.backup': scheduled,
} as const;

export type JobName = keyof typeof JOBS;
export type JobPayload<Name extends JobName> = z.infer<(typeof JOBS)[Name]>;
export const JOB_NAMES = Object.keys(JOBS) as JobName[];

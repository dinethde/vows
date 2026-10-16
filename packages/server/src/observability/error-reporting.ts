import * as Sentry from '@sentry/node';

import type { Env } from '../config/env';
import { CRON_TIMEZONE } from '../queue/catalogue';

/**
 * Sentry, for the API and the worker. Nothing is sent unless SENTRY_DSN is
 * set, so a laptop and CI report nothing. Only errors: there is no tracing,
 * and no personal data is attached. It starts after Nest has loaded, which is
 * enough for errors; Sentry's request tracing would need it earlier.
 */
export function startErrorReporting(env: Env): boolean {
  if (!env.SENTRY_DSN) return false;
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.APP_ENV,
    serverName: env.VOWS_SERVICE,
    sendDefaultPii: false,
    ...(env.SENTRY_RELEASE ? { release: env.SENTRY_RELEASE } : {}),
  });
  return true;
}

/** A failure someone should hear about, with what it was doing as tags. */
export function reportFailure(error: unknown, context: Record<string, string>): void {
  Sentry.withScope((scope) => {
    scope.setTags(context);
    Sentry.captureException(error);
  });
}

export interface Schedule {
  /** The cron line, in Asia/Colombo. */
  cron: string;
  /** How long a run may take before it counts as stuck. */
  maxSeconds: number;
}

/**
 * The dead-man's switch for a scheduled job. Sentry expects a check-in on the
 * job's schedule; a run that fails, overruns or never happens raises an
 * issue. Without a DSN the work simply runs. The check-ins are sent by hand:
 * the SDK's `withMonitor` left a failed run's rejection unhandled, which in
 * the worker would end the process.
 */
export async function monitored<T>(
  slug: string,
  schedule: Schedule,
  work: () => Promise<T>,
): Promise<T> {
  const config = {
    schedule: { type: 'crontab' as const, value: schedule.cron },
    timezone: CRON_TIMEZONE,
    checkinMargin: 10,
    maxRuntime: Math.ceil(schedule.maxSeconds / 60) + 1,
    failureIssueThreshold: 1,
    recoveryThreshold: 1,
  };
  const started = Date.now();
  const checkInId = Sentry.captureCheckIn({ monitorSlug: slug, status: 'in_progress' }, config);
  const finish = (status: 'ok' | 'error'): void => {
    const duration = (Date.now() - started) / 1000;
    Sentry.captureCheckIn({ checkInId, monitorSlug: slug, status, duration }, config);
  };
  try {
    const result = await work();
    finish('ok');
    return result;
  } catch (error) {
    finish('error');
    throw error;
  }
}

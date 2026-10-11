import pino from 'pino';
import type { Logger } from 'pino';

export const LOGGER = Symbol('LOGGER');
export type { Logger };

/** JSON lines to stdout. Fly collects them; there is nothing else to configure. */
export function createLogger(service: string, env: string, level: string): Logger {
  return pino({
    level,
    base: { env, service },
    // An enquiry is personal. None of it belongs in a log line.
    redact: ['email', 'phone', 'name', 'notes', '*.email', '*.phone', '*.name', '*.notes'],
  });
}

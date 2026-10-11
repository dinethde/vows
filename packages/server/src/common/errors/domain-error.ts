import type { ErrorCode } from '@vows/contracts';

/**
 * What a service throws. It knows a code and a sentence for the photographer,
 * and nothing about HTTP. The filter is the only place a status is chosen.
 */
export class DomainError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(code: ErrorCode = 'not_found', message = 'We could not find that.') {
    super(code, message);
  }
}

export class UnauthorizedError extends DomainError {
  constructor() {
    super('unauthorized', 'Unauthorized');
  }
}

export class ForbiddenError extends DomainError {
  constructor() {
    super('forbidden', 'Forbidden');
  }
}

export class ValidationError extends DomainError {
  constructor(fields: Record<string, string>) {
    super('bad_request', 'Some of what was sent is not right. Check the marked fields.', fields);
  }
}

export class RateLimitedError extends DomainError {
  constructor(
    message: string,
    readonly retryAfterSeconds: number,
  ) {
    super('rate_limited', message);
  }
}

/** A job that can never succeed: a file that is not an image will not become one. */
export class PermanentJobError extends Error {
  readonly retryable = false;
}

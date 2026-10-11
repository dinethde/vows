import { Catch, HttpException, Inject } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { ErrorCode, ErrorEnvelope } from '@vows/contracts';
import type { Response } from 'express';

import { DomainError, RateLimitedError } from '../errors/domain-error';
import { STATUS } from '../errors/status';
import { LOGGER } from '../logger';
import type { Logger } from '../logger';
import type { VowsRequest } from '../request';

const HTTP_CODES: Partial<Record<number, ErrorCode>> = {
  400: 'bad_request',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not_found',
};

interface Failure {
  status: number;
  code: ErrorCode;
  message: string;
  fields?: Record<string, string>;
}

function describe(error: unknown): Failure {
  if (error instanceof DomainError) {
    const failure: Failure = {
      status: STATUS[error.code],
      code: error.code,
      message: error.message,
    };
    return error.fields ? { ...failure, fields: error.fields } : failure;
  }
  if (error instanceof HttpException) {
    const code = HTTP_CODES[error.getStatus()];
    if (code)
      return {
        status: error.getStatus(),
        code,
        message: code === 'not_found' ? 'Not found' : error.message,
      };
  }
  return { status: 500, code: 'internal_error', message: 'Something went wrong on our side.' };
}

/** The only place a failure becomes a status code and an envelope. */
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  constructor(@Inject(LOGGER) private readonly log: Logger) {}

  catch(error: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<VowsRequest>();
    const response = http.getResponse<Response>();
    const failure = describe(error);
    const requestId = request.requestId;

    if (failure.status >= 500) this.log.error({ requestId, err: error }, 'request failed');
    if (error instanceof RateLimitedError) {
      response.setHeader('Retry-After', String(error.retryAfterSeconds));
    }

    const body: ErrorEnvelope = {
      error: {
        code: failure.code,
        message: failure.message,
        requestId,
        ...(failure.fields ? { fields: failure.fields } : {}),
      },
    };
    response.status(failure.status).json(body);
  }
}

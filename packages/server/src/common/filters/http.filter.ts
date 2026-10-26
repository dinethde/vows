import { Catch, HttpException, Inject } from "@nestjs/common";
import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import type { ErrorCode, ErrorEnvelope } from "@vows/contracts";
import type { Response } from "express";

import { reportFailure } from "../../observability/error-reporting";
import { DomainError, RateLimitedError } from "../errors/domain-error";
import { STATUS } from "../errors/status";
import { LOGGER } from "../logger";
import type { Logger } from "../logger";
import type { VowsRequest } from "../request";
import { clashOf } from "./clash";

const HTTP_CODES: Partial<Record<number, ErrorCode>> = {
  400: "bad_request",
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
};

const PAYLOAD_TOO_LARGE = 413;

interface Failure {
  status: number;
  code: ErrorCode;
  message: string;
  fields?: Record<string, string>;
}

/**
 * Nest raises these itself: an unknown route, a body it cannot read, a body
 * that is too large. Any other refusal of the caller's request is a 400; it
 * is never reported as our fault.
 */
function describeStatus(status: number, message: string): Failure {
  const code = HTTP_CODES[status];
  if (code) return { status, code, message: code === "not_found" ? "Not found" : message };
  if (status === PAYLOAD_TOO_LARGE)
    return { status: 400, code: "bad_request", message: "That request is too large." };
  if (status >= 400 && status < 500)
    return { status: 400, code: "bad_request", message: "We could not read that request." };
  return { status: 500, code: "internal_error", message: "Something went wrong on our side." };
}

/** The body parser refuses a request before Nest sees it, with its own kind of error. */
function parserStatus(error: unknown): number | undefined {
  const status = (error as { status?: unknown } | null)?.status;
  return typeof status === "number" && status >= 400 && status < 500 ? status : undefined;
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
  if (error instanceof HttpException) return describeStatus(error.getStatus(), error.message);
  const refused = parserStatus(error);
  if (refused) return describeStatus(refused, "We could not read that request.");
  const clash = clashOf(error);
  if (clash) return { status: STATUS[clash.code], ...clash };
  return { status: 500, code: "internal_error", message: "Something went wrong on our side." };
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

    if (failure.status >= 500) {
      this.log.error({ requestId, err: error }, "request failed");
      reportFailure(error, { requestId, route: request.path });
    }
    if (error instanceof RateLimitedError) {
      response.setHeader("Retry-After", String(error.retryAfterSeconds));
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

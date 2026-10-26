import { Inject, Injectable } from "@nestjs/common";
import type { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import type { NextFunction, Response } from "express";
import { randomUUID } from "node:crypto";
import { tap } from "rxjs";
import type { Observable } from "rxjs";

import { LOGGER } from "../logger";
import type { Logger } from "../logger";
import type { VowsRequest } from "../request";

/**
 * Runs before everything, guards included, so even a 401 carries a request id.
 * A caller may send its own, which is how one id threads web, API and worker.
 */
export function attachRequestId(
  request: VowsRequest,
  response: Response,
  next: NextFunction,
): void {
  const sent = request.header("x-request-id");
  request.requestId = sent && sent.length <= 64 ? sent : `req_${randomUUID().replaceAll("-", "")}`;
  response.setHeader("x-request-id", request.requestId);
  next();
}

/** One line per request: route, actor, duration, request id. */
@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
  constructor(@Inject(LOGGER) private readonly log: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<VowsRequest>();
    const started = Date.now();
    const route = `${request.method} ${String((request.route as { path?: string } | undefined)?.path ?? request.path)}`;
    return next.handle().pipe(
      tap(() => {
        this.log.info(
          {
            requestId: request.requestId,
            actorId: request.actor?.clerkId,
            route,
            durationMs: Date.now() - started,
          },
          "request",
        );
      }),
    );
  }
}

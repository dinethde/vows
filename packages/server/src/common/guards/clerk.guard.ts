import { Inject, Injectable } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { jwtVerify } from "jose";
import type { JWTVerifyGetKey } from "jose";

import { ENV } from "../../config/env";
import type { Env } from "../../config/env";
import { ROLES_KEY } from "../decorators/auth";
import { ForbiddenError, UnauthorizedError } from "../errors/domain-error";
import { LOGGER } from "../logger";
import type { Logger } from "../logger";
import type { Role, VowsRequest } from "../request";

export const JWKS = Symbol("JWKS");
const ROLES: readonly string[] = ["owner", "editor"];

function readRole(metadata: unknown): Role | undefined {
  const role = (metadata as { role?: unknown } | undefined)?.role;
  return typeof role === "string" && ROLES.includes(role) ? (role as Role) : undefined;
}

/**
 * Clerk owns identity; this owns permission. Every request is verified: there
 * is no session cache. A 401 and a 403 never explain themselves — the reason
 * goes to the log, keyed by request id.
 */
@Injectable()
export class ClerkGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(ENV) private readonly env: Env,
    @Inject(JWKS) private readonly jwks: JWTVerifyGetKey,
    @Inject(LOGGER) private readonly log: Logger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<VowsRequest>();
    const payload = await this.verify(request);

    // A Clerk token is valid everywhere on the instance. Without this check a
    // token minted for another app would pass the signature and the issuer.
    if (typeof payload.azp !== "string" || !this.env.WEB_ORIGINS.includes(payload.azp)) {
      this.log.warn({ requestId: request.requestId, claim: "azp" }, "token refused");
      throw new UnauthorizedError();
    }

    const role = readRole(payload.public_metadata);
    if (!role || typeof payload.sub !== "string") throw new ForbiddenError();
    if (!required.includes(role)) throw new ForbiddenError();

    request.actor = { clerkId: payload.sub, role };
    return true;
  }

  private async verify(request: VowsRequest): Promise<Record<string, unknown>> {
    const header = request.header("authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
    if (!token) throw new UnauthorizedError();
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.env.CLERK_ISSUER,
        clockTolerance: 5,
      });
      return payload;
    } catch (error) {
      const reason = error instanceof Error ? error.name : "unknown";
      this.log.warn({ requestId: request.requestId, reason }, "token refused");
      throw new UnauthorizedError();
    }
  }
}

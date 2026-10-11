import { createParamDecorator, SetMetadata } from '@nestjs/common';
import type { CustomDecorator, ExecutionContext } from '@nestjs/common';

import type { Actor, Role, VowsRequest } from '../request';

export const ROLES_KEY = 'vows:roles';

/** The roles that may call a route. A route with none is public. */
export const Roles = (...roles: Role[]): CustomDecorator => SetMetadata(ROLES_KEY, roles);

/** The verified caller. Never read from a header, a cookie or a body. */
export const CurrentActor = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Actor => {
    const actor = context.switchToHttp().getRequest<VowsRequest>().actor;
    if (!actor) throw new Error('CurrentActor used on a route with no @Roles.');
    return actor;
  },
);

export const RequestId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string =>
    context.switchToHttp().getRequest<VowsRequest>().requestId,
);

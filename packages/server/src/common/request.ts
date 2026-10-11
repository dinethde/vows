import type { Request } from 'express';

export type Role = 'owner' | 'editor';

export interface Actor {
  clerkId: string;
  role: Role;
}

/** What the interceptor and the guard hang on a request on its way in. */
export interface VowsRequest extends Request {
  requestId: string;
  actor?: Actor;
}

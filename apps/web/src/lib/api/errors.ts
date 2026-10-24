import type { ErrorCode } from '@vows/contracts';

export interface ApiErrorDetails {
  status: number;
  code: ErrorCode;
  message: string;
  requestId: string;
  fields?: Record<string, string> | undefined;
}

/** Any answer that is not a 2xx, in one shape, so a form has one branch to write. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly requestId: string;
  readonly fields: Record<string, string>;

  constructor(details: ApiErrorDetails) {
    super(details.message);
    this.name = 'ApiError';
    this.status = details.status;
    this.code = details.code;
    this.requestId = details.requestId;
    this.fields = details.fields ?? {};
  }
}

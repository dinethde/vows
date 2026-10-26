import { errorEnvelope } from "@vows/contracts";
import type { ZodType, ZodTypeDef } from "zod";

import { env } from "@/config/env";

import { ApiError } from "./errors";

const TIMEOUT_MS = 15_000;

export type TokenGetter = () => Promise<string | null>;

export interface RequestOptions<Output> {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** The reply is parsed here, so a renamed field fails at the boundary. */
  schema?: ZodType<Output, ZodTypeDef, unknown>;
  idempotencyKey?: string;
  /** Extra headers for one call, such as the visitor's signed address. */
  headers?: Record<string, string>;
  /** Cache tags for a public read. Ignored whenever a token is present. */
  next?: { tags?: string[]; revalidate?: number | false };
}

export type Transport = <Output = undefined>(
  path: string,
  options?: RequestOptions<Output>,
) => Promise<Output>;

function requestId(): string {
  return `req_${crypto.randomUUID().replaceAll("-", "")}`;
}

async function failure(response: Response): Promise<ApiError> {
  const envelope = errorEnvelope.safeParse(await response.json().catch(() => null));
  if (envelope.success) return new ApiError({ status: response.status, ...envelope.data.error });
  return new ApiError({
    status: response.status,
    code: "internal_error",
    message: "Something went wrong on our side.",
    requestId: response.headers.get("x-request-id") ?? "",
  });
}

function headersFor<Output>(
  token: string | null,
  options: RequestOptions<Output>,
): Record<string, string> {
  const headers: Record<string, string> = { ...options.headers, "x-request-id": requestId() };
  if (token) headers.authorization = `Bearer ${token}`;
  if (options.body !== undefined) headers["content-type"] = "application/json";
  if (options.idempotencyKey) headers["idempotency-key"] = options.idempotencyKey;
  return headers;
}

/** A token means the reply belongs to one person, so it is never stored. */
function cachingFor<Output>(token: string | null, options: RequestOptions<Output>): RequestInit {
  if (token) return { cache: "no-store" };
  return options.next ? { next: options.next } : {};
}

/**
 * The one place that calls fetch against the API. It adds the address, the
 * token, the request id and the idempotency key, and it sets `no-store`
 * whenever a token is present: without that, Next may cache an authenticated
 * reply and hand it to a different signed-in person.
 */
export function createTransport(getToken?: TokenGetter): Transport {
  return async <Output = undefined>(
    path: string,
    options: RequestOptions<Output> = {},
  ): Promise<Output> => {
    const token = getToken ? await getToken() : null;
    const response = await fetch(`${env.API_URL.replace(/\/$/, "")}${path}`, {
      method: options.method ?? "GET",
      headers: headersFor(token, options),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
      ...cachingFor(token, options),
    });

    if (!response.ok) throw await failure(response);
    if (response.status === 204 || !options.schema) return undefined as Output;
    return options.schema.parse(await response.json());
  };
}

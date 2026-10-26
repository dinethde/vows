import type { ErrorCode } from "@vows/contracts";
import { ApiError } from "@/lib/api";

export interface ActionFailure {
  ok: false;
  code: ErrorCode;
  /** Written for the photographer by the API. Safe to show as it is. */
  message: string;
  /** Which field or slot is wrong, from a 400 or a 422. Empty otherwise. */
  fields: Record<string, string>;
}

export interface ActionSuccess<Data> {
  ok: true;
  data: Data;
}

/** What every Studio server action answers with: the new state, or why not. */
export type ActionResult<Data> = ActionSuccess<Data> | ActionFailure;

const UNREACHABLE = "We could not reach the Studio’s server. Check the connection and try again.";

/** A refusal becomes a value, because an error thrown in an action loses its fields. */
export async function toResult<Data>(work: Promise<Data>): Promise<ActionResult<Data>> {
  try {
    return { ok: true, data: await work };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, code: error.code, message: error.message, fields: error.fields };
    }
    console.error(error);
    return { ok: false, code: "internal_error", message: UNREACHABLE, fields: {} };
  }
}

export function invalid(message: string): ActionFailure {
  return { ok: false, code: "bad_request", message, fields: {} };
}

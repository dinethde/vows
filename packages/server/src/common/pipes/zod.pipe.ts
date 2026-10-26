import type { PipeTransform } from "@nestjs/common";
import type { ZodType, ZodTypeDef } from "zod";

import { ValidationError } from "../errors/domain-error";

/**
 * A controller only ever receives the parsed value. The raw body is out of
 * reach from here on, so an unvalidated field cannot be trusted by accident.
 */
export class ZodPipe<Output> implements PipeTransform<unknown, Output> {
  constructor(private readonly schema: ZodType<Output, ZodTypeDef, unknown>) {}

  transform(value: unknown): Output {
    const parsed = this.schema.safeParse(value);
    if (parsed.success) return parsed.data;

    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".") || "body";
      fields[path] ??= issue.message;
    }
    throw new ValidationError(fields);
  }
}

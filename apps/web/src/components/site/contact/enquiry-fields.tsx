"use client";

import type { UseFormReturn } from "react-hook-form";

import type { ReactElement } from "react";

import { Field } from "@vows/ui";

import type { EnquiryFields } from "./enquiry-form.schema";
import { WeddingDateField } from "./wedding-date-field";

export interface EnquiryFieldsProps {
  form: UseFormReturn<EnquiryFields>;
}

/** Field has no `error` prop at all when there is nothing wrong. */
function errorProp(message: string | undefined): { error?: string } {
  return message ? { error: message } : {};
}

/** The six questions. The star and the spoken "required" both come from one prop. */
export function EnquiryFieldList({ form }: EnquiryFieldsProps): ReactElement {
  const { register, formState } = form;
  const error = (name: keyof EnquiryFields): { error?: string } =>
    errorProp(formState.errors[name]?.message);
  return (
    <div className="tablet:gap-space-8 flex flex-col gap-[26px]">
      <Field
        surface="site"
        label="Your name"
        required
        // Safe here: this field only ever exists inside an open dialog.
        autoFocus
        autoComplete="name"
        {...register("name")}
        {...error("name")}
      />
      <Field
        surface="site"
        label="Email"
        required
        type="email"
        inputMode="email"
        autoComplete="email"
        {...register("email")}
        {...error("email")}
      />
      <Field
        surface="site"
        label="Mobile"
        required
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        {...register("phone")}
        {...error("phone")}
      />
      <WeddingDateField control={form.control} />
      <Field
        surface="site"
        label="Wedding place"
        {...register("weddingPlace")}
        {...error("weddingPlace")}
      />
      <Field
        surface="site"
        label="Additional notes"
        maxLength={2000}
        {...register("notes")}
        {...error("notes")}
      />
    </div>
  );
}

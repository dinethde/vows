"use client";

import { sendEnquiry } from "@/app/(site)/contact/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { useState } from "react";

import { EMPTY, enquiryFields } from "./enquiry-form.schema";
import type { EnquiryFields } from "./enquiry-form.schema";

export interface EnquiryFormState {
  form: UseFormReturn<EnquiryFields>;
  /** A problem that belongs to no single field, such as too many messages in an hour. */
  failure: string | null;
  sent: boolean;
  submit: (event: React.FormEvent<HTMLFormElement>) => void;
  /** The hidden field a person never fills in. */
  honeypot: { value: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void };
}

/**
 * The form's logic, apart from its markup. Fields are checked when someone
 * leaves them, then on every change once touched. A failed send keeps every
 * word that was typed.
 */
export function useEnquiryForm(): EnquiryFormState {
  const form = useForm<EnquiryFields>({
    resolver: zodResolver(enquiryFields),
    defaultValues: EMPTY,
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const [openedAt] = useState(() => Date.now());
  const [website, setWebsite] = useState("");
  const [failure, setFailure] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = form.handleSubmit(async (values) => {
    setFailure(null);
    const result = await sendEnquiry({
      name: values.name,
      email: values.email,
      phone: values.phone,
      weddingDate: values.weddingDate,
      ...(values.weddingPlace ? { weddingPlace: values.weddingPlace } : {}),
      ...(values.notes ? { notes: values.notes } : {}),
      website,
      openedAt,
    });
    if (result.ok) {
      setSent(true);
      return;
    }
    const known = Object.keys(EMPTY) as (keyof EnquiryFields)[];
    for (const name of known) {
      const message = result.fields[name];
      if (message) form.setError(name, { message });
    }
    if (!known.some((name) => result.fields[name])) setFailure(result.message);
  });

  return {
    form,
    failure,
    sent,
    submit: (event) => void submit(event),
    honeypot: {
      value: website,
      onChange: (event) => {
        setWebsite(event.target.value);
      },
    },
  };
}

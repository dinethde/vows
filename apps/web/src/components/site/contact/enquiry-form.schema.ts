import { createEnquiry } from "@vows/contracts";
import { z } from "zod";

import { todayIso } from "@/components/shared/date/calendar";

/** What the visitor types. The honeypot and the open time are added on submit. */
export const enquiryFields = createEnquiry
  .pick({
    name: true,
    email: true,
    phone: true,
    weddingPlace: true,
    notes: true,
  })
  .extend({
    weddingDate: z
      .string()
      .min(1, "Tell us the wedding date, even a rough one.")
      .date("Type the date in full, like 14 February 2027, or pick it below.")
      .refine((day) => day >= todayIso(), "That date has passed. Check the year."),
  });

export type EnquiryFields = z.infer<typeof enquiryFields>;

export const EMPTY: EnquiryFields = {
  name: "",
  email: "",
  phone: "",
  weddingDate: "",
  weddingPlace: "",
  notes: "",
};

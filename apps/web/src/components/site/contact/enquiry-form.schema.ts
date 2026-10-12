import { createEnquiry } from '@vows/contracts';
import type { z } from 'zod';

/** What the visitor types. The honeypot and the open time are added on submit. */
export const enquiryFields = createEnquiry.pick({
  name: true,
  email: true,
  phone: true,
  weddingDate: true,
  weddingPlace: true,
  notes: true,
});

export type EnquiryFields = z.infer<typeof enquiryFields>;

export const EMPTY: EnquiryFields = {
  name: '',
  email: '',
  phone: '',
  weddingDate: '',
  weddingPlace: '',
  notes: '',
};

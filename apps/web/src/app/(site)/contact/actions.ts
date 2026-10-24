'use server';

import { createEnquiry } from '@vows/contracts';
import type { CreateEnquiry } from '@vows/contracts';

import { visitorHeaders } from './visitor';

import { ApiError, publicApi } from '@/lib/api';

export type SendEnquiryResult =
  | { ok: true }
  | { ok: false; message: string; fields: Record<string, string> };

const UNREACHABLE = 'We could not send that just now. Please try again, or email us instead.';

/**
 * The form posts here, and this calls the API. The same schema parses on both
 * sides; the copy in the browser is for speed of feedback, not for safety.
 */
export async function sendEnquiry(input: CreateEnquiry): Promise<SendEnquiryResult> {
  const parsed = createEnquiry.safeParse(input);
  if (!parsed.success) {
    const fields = Object.fromEntries(
      parsed.error.issues.map((issue) => [issue.path.join('.'), issue.message] as const),
    );
    return { ok: false, message: 'Check the marked fields.', fields };
  }
  // Outside the try: a missing secret is a fault in the deployment, and it
  // must surface as one, not as a polite message every visitor gets.
  const visitor = await visitorHeaders();
  try {
    await publicApi().enquiries.create(parsed.data, visitor);
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError)
      return { ok: false, message: error.message, fields: error.fields };
    // The API could not be reached. The visitor is told to try again or email;
    // the server log is told why.
    console.error('enquiry not sent', error);
    return { ok: false, message: UNREACHABLE, fields: {} };
  }
}

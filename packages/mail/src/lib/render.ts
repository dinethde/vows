import { render } from "@react-email/components";

import type { ReactElement } from "react";

export interface RenderedMail {
  subject: string;
  html: string;
  /** Some clients only take this one. */
  text: string;
}

export async function renderMail(subject: string, element: ReactElement): Promise<RenderedMail> {
  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);
  return { subject, html, text };
}

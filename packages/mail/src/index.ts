import { createElement } from "react";

import { renderMail } from "./lib/render";
import type { RenderedMail } from "./lib/render";
import { EnquiryNotify, enquiryNotifySubject } from "./templates/enquiry-notify";
import type { EnquiryNotifyProps } from "./templates/enquiry-notify";
import { ENQUIRY_RECEIVED_SUBJECT, EnquiryReceived } from "./templates/enquiry-received";
import type { EnquiryReceivedProps } from "./templates/enquiry-received";

export { createMailer } from "./lib/mailer";
export type { Mailer, MailerOptions } from "./lib/mailer";
export type { RenderedMail } from "./lib/render";
export type { EnquiryNotifyProps } from "./templates/enquiry-notify";
export type { EnquiryReceivedProps } from "./templates/enquiry-received";

export function renderEnquiryNotify(props: EnquiryNotifyProps): Promise<RenderedMail> {
  return renderMail(enquiryNotifySubject(props), createElement(EnquiryNotify, props));
}

export function renderEnquiryReceived(props: EnquiryReceivedProps): Promise<RenderedMail> {
  return renderMail(ENQUIRY_RECEIVED_SUBJECT, createElement(EnquiryReceived, props));
}

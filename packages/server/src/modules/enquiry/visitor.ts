import { createHmac, timingSafeEqual } from "node:crypto";

export const VISITOR_IP_HEADER = "x-vows-visitor-ip";
export const VISITOR_SIGNATURE_HEADER = "x-vows-visitor-signature";

/** What the web app signs: the address, marked so it can never pass as a rebuild body. */
export function signVisitor(ip: string, secret: string): string {
  return createHmac("sha256", secret).update(`visitor:${ip}`).digest("hex");
}

export interface VisitorClaim {
  /** The address of whoever connected to the API. For the contact form that is the web server. */
  connection: string;
  /** The visitor's address as the web app saw it, and its signature. */
  claimed: string | undefined;
  signature: string | undefined;
}

/**
 * Whose enquiry this is, for the hourly limit. The form posts from the web
 * server, so the connection is the same for every visitor; the web app passes
 * the visitor's own address on and signs it. A claim that is unsigned or
 * signed wrongly is ignored, or anyone calling the API could name an address.
 */
export function visitorAddress(claim: VisitorClaim, secret: string): string {
  const { connection, claimed, signature } = claim;
  if (!claimed || !signature) return connection;
  const expected = Buffer.from(signVisitor(claimed, secret));
  const given = Buffer.from(signature);
  const genuine = expected.length === given.length && timingSafeEqual(expected, given);
  return genuine ? claimed : connection;
}

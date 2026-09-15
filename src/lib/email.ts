/**
 * Email obfuscation for the footer (DESIGN.md §13.4).
 *
 * The address is stored split, and neither the visible text nor the `href` nor
 * the accessible name contains it in the served HTML:
 *
 *   - the text is written backwards and turned round again by CSS, so a regex
 *     over the page source finds `moc.liamg@avlisdakunid`, which matches no
 *     address pattern;
 *   - the `mailto:` href and the `aria-label` are attached on the client after
 *     hydration, because an address in an attribute is the easiest thing of all
 *     to scrape.
 *
 * What this is honest about: it defeats scrapers that read HTML, not ones that
 * run a browser. The point is to raise the cost above "grep the page source".
 *
 * A screen reader is never asked to read the reversed string — once hydrated
 * the link's accessible name is the real address, and the reversed span is
 * `aria-hidden`.
 */
import { email } from "~/data/contact";

/** The real address. Client-side only — never rendered on the server. */
export function emailAddress() {
  return `${email.user}@${email.domain}`;
}

/** What is actually written into the markup: the address, backwards. */
export function emailReversed() {
  return [...emailAddress()].reverse().join("");
}

export function mailtoHref() {
  return `mailto:${emailAddress()}`;
}

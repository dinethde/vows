/**
 * The studio's real contact details and the footer's link lists
 * (DESIGN.md §13.4). Content, not markup — nothing here is hardcoded into a
 * component, so changing a phone number or adding a social does not touch JSX.
 */

export type FooterLink = {
  label: string;
  href: string;
  /** Leaves the site: earns `rel="noreferrer noopener"`. */
  external?: boolean;
  /**
   * Opens in a new tab. True for everything external, and separately for the
   * rates PDF — same-origin, but a download should not replace the page the
   * visitor was reading.
   */
  newTab?: boolean;
};

/**
 * The address is held split so the complete string never appears as a literal
 * in the bundle or the server-rendered markup. See `src/lib/email.ts` for how
 * it is reassembled and what that does and does not protect against.
 */
export const email = { user: "dinukadsilva", domain: "gmail.com" } as const;

export const phone = {
  /** As dialled — E.164, for the `tel:` href. */
  dial: "+94716570999",
  /** As shown. */
  display: "+94716570999",
} as const;

export const studio = {
  label: "Wadduwa",
  /** Opens the location in the visitor's default map app. */
  href: "https://www.google.com/maps/search/?api=1&query=Wadduwa%2C+Sri+Lanka",
} as const;

export const menuLinks: FooterLink[] = [
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Chat", href: "/contact" },
];

export const socialLinks: FooterLink[] = [
  { label: "Instagram", href: "https://instagram.com/vowsweddings", external: true, newTab: true },
  { label: "Pinterest", href: "https://pinterest.com/vowsweddings", external: true, newTab: true },
  { label: "Facebook", href: "https://facebook.com/vowsweddings", external: true, newTab: true },
  { label: "TikTok", href: "https://tiktok.com/@vowsweddings", external: true, newTab: true },
  { label: "WhatsApp", href: "https://wa.me/94716570999", external: true, newTab: true },
];

export const legalLinks: FooterLink[] = [
  { label: "Rates (PDF)", href: "/rates.pdf", newTab: true },
  { label: "Cookies Policy", href: "/cookies" },
  { label: "Privacy Policy", href: "/privacy" },
];

export const copyright = "©2026 Vows Weddings";

import { useEffect, useRef, type Ref } from "react";

import {
  copyright,
  legalLinks,
  menuLinks,
  phone,
  socialLinks,
  studio,
  type FooterLink,
} from "~/data/contact";
import { WordmarkParticles } from "~/components/wordmark-particles";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { emailAddress, emailReversed, mailtoHref } from "~/lib/email";
import { copy } from "~/data/copy";

const HOVER =
  "transition-opacity duration-[var(--duration-fast)] ease-hover hover:opacity-[var(--hover-link-opacity)]";

/**
 * The standing panel that closes every content page (DESIGN.md §13).
 *
 * White ground against the page's near-white, a 24px radius on the top corners
 * only so it reads as a card the page slides beneath. Four column groups along
 * the top, the wordmark set as large as the gutters allow, a rail of legal
 * links along the bottom edge.
 *
 * Rendered by the `_site` layout route rather than imported into a page, so
 * every content route added later inherits it. The home page sits outside that
 * layout deliberately — see the note in src/routes/_site.tsx.
 *
 * Placement is CSS grid throughout: the column x positions in the Figma frame
 * are expressed as the `--footer-cols` tracks, which is what lets the same
 * markup serve all three breakpoints and what corrects the drift in the frame
 * where the four groups do not share a top.
 *
 * Vertically it is three bands filling one viewport (§13.2) — the three
 * children below are those bands, in order, and the CSS does the rest. The
 * `ref` is how the layout watches the panel to hide the navbar for it (§13.9).
 */
export function SiteFooter({ ref }: { ref?: Ref<HTMLElement> }) {
  return (
    <footer
      ref={ref}
      data-site-footer=""
      aria-label={copy.a11y.footer.region}
      className="vows-footer w-full rounded-t-[var(--footer-radius)] bg-surface"
    >
      <div className="vows-footer-columns grid">
        <LinkColumn label={copy.footer.menuLabel} links={menuLinks} area="menu" />
        <LinkColumn
          label={copy.footer.socialsLabel}
          links={socialLinks}
          area="socials"
        />

        {/* One column from 768 up. On mobile this wrapper is `display: contents`
            so Email and Hotline become grid items in their own right and can
            take separate rows — the address is too wide to share one. */}
        <div className="vows-footer-contact">
          <EmailBlock />
          <ContactBlock
            label={copy.footer.hotlineLabel}
            area="hotline"
            href={`tel:${phone.dial}`}
          >
            {phone.display}
          </ContactBlock>
        </div>

        <ContactBlock
          label={copy.footer.studioLabel}
          area="studio"
          href={studio.href}
          external
          pin
        >
          {studio.label}
        </ContactBlock>
      </div>

      <Wordmark />
      <LegalRail />
    </footer>
  );
}

/**
 * A label and the links under it.
 *
 * The label is signage, not a link: it is the list's heading, so the group
 * reads as "Menu, list, 4 items" rather than dissolving into nine loose links.
 * It is deliberately not focusable, not hoverable and not styled like a link.
 */
function LinkColumn({
  label,
  links,
  area,
}: {
  label: string;
  links: FooterLink[];
  area: string;
}) {
  return (
    <div style={{ gridArea: area }}>
      <ColumnLabel>{label}</ColumnLabel>
      <ul
        aria-label={label}
        className="mt-[var(--footer-label-gap)] flex flex-col gap-[var(--footer-link-gap)]"
      >
        {links.map((link) => (
          <li key={link.label}>
            <FooterAnchor className={`text-footer-link ${HOVER}`} link={link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ColumnLabel({ children }: { children: string }) {
  return (
    <h2 className="text-footer-label font-sans font-medium text-label">
      {children}
    </h2>
  );
}

/**
 * A plain anchor, like the navbar's links and for the same reason: most of
 * these destinations are not routes yet, and a router `Link` to a path with no
 * route throws rather than degrading to an ordinary link.
 */
function FooterAnchor({
  link,
  className,
}: {
  link: FooterLink;
  className: string;
}) {
  return (
    <a
      className={`font-serif text-ink-muted ${className}`}
      href={link.href}
      {...(link.external
        ? { rel: "noreferrer noopener", target: "_blank" }
        : {})}
    >
      {link.label}
    </a>
  );
}

/** A label and one contact value, optionally preceded by the location pin. */
function ContactBlock({
  label,
  area,
  href,
  external,
  pin,
  children,
}: {
  label: string;
  area: string;
  href: string;
  external?: boolean;
  pin?: boolean;
  children: string;
}) {
  const value = (
    <a
      className={`text-footer-value font-serif text-ink-muted ${HOVER}`}
      href={href}
      {...(external ? { rel: "noreferrer noopener", target: "_blank" } : {})}
    >
      {children}
    </a>
  );

  return (
    <div style={{ gridArea: area }}>
      <ColumnLabel>{label}</ColumnLabel>
      <div className="text-footer-value mt-[var(--footer-label-gap)]">
        {pin ? (
          <span className="flex items-center gap-[var(--footer-pin-gap)]">
            <LocationPin />
            {value}
          </span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

/**
 * The address is written backwards and turned round again by CSS, and the real
 * value is attached after hydration, so it appears in neither the markup nor
 * the attributes of the served HTML. See src/lib/email.ts for what that does
 * and does not protect against.
 */
function EmailBlock() {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const anchor = ref.current;
    if (!anchor) return;
    anchor.href = mailtoHref();
    // Until this runs the accessible name would be the reversed string, so the
    // real address is what a screen reader is given, not the disguise.
    anchor.setAttribute("aria-label", emailAddress());
  }, []);

  return (
    <div className="vows-footer-email-block" style={{ gridArea: "email" }}>
      <ColumnLabel>{copy.footer.emailLabel}</ColumnLabel>
      <div className="text-footer-value mt-[var(--footer-label-gap)]">
        <a
          ref={ref}
          className={`vows-footer-email text-footer-value font-serif text-ink-muted ${HOVER}`}
        >
          <span aria-hidden>{emailReversed()}</span>
        </a>
      </div>
    </div>
  );
}

/** Decorative: "Wadduwa" next to it carries the meaning, so AT skips it. */
function LocationPin() {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 18 18"
      fill="none"
      className="vows-footer-pin shrink-0 text-pin"
    >
      <path
        d="M9 15.75C11.625 13.05 14.25 10.6323 14.25 7.65C14.25 4.66766 11.8995 2.25 9 2.25C6.10051 2.25 3.75 4.66766 3.75 7.65C3.75 10.6323 6.375 13.05 9 15.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9.75C10.2427 9.75 11.25 8.74267 11.25 7.5C11.25 6.25736 10.2427 5.25 9 5.25C7.75732 5.25 6.75 6.25736 6.75 7.5C6.75 8.74267 7.75732 9.75 9 9.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Set as large as the gutters allow, from Mate's measured advance width rather
 * than a guessed ratio — see `--wordmark-ratio` in tokens.css.
 *
 * Two spans with a space between them: mobile breaks between the words, and
 * because the size is derived from the width of "Weddings" alone, that line
 * can never be the one that overruns.
 *
 * A real heading with the real text, always. The character field (§13.10) is a
 * canvas laid over it: the studio's name is the most important text on the
 * site, and a canvas-only wordmark would take it away from search engines and
 * screen readers both. Under reduced motion the canvas never mounts and this
 * is simply the name, as drawn.
 */
function Wordmark() {
  const [first, second] = copy.footer.wordmarkLines;
  const textRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  return (
    <h2
      data-particles={!reducedMotion}
      className="vows-footer-wordmark text-center font-serif text-ink"
    >
      {/* Both words in one span: the heading is a flex container so it can
          centre them in the band, and without this wrapper each word would
          become a flex item and the mobile line break would be lost. It is
          also the box the field fills. */}
      <span ref={textRef}>
        <span>{first}</span> <span>{second}</span>
        {!reducedMotion && <WordmarkParticles hostRef={textRef} />}
      </span>
    </h2>
  );
}

function LegalRail() {
  return (
    <ul
      aria-label={copy.a11y.footer.legal}
      className="vows-footer-legal grid"
    >
      <li className="text-legal" style={{ gridArea: "copyright" }}>
        <span className="font-serif text-ink-muted">{copyright}</span>
      </li>
      {legalLinks.map((link, index) => (
        <li
          key={link.label}
          className="text-legal"
          style={{ gridArea: `legal${index + 1}` }}
        >
          <FooterAnchor className={`text-legal ${HOVER}`} link={link} />
        </li>
      ))}
    </ul>
  );
}
